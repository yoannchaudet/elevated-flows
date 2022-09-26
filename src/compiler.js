const espree = require('espree')
const fs = require('fs')
const yaml = require('yaml')

// Class responsible for parsing and validating a flow
class FlowParser {
  // Ctor
  constructor(flowPath) {
    // Keep track of the file we are parsing
    this.flowPath = flowPath
    this.parsed = false

    // List of module dependencies
    this.modules = []

    // Flow config
    this.config = {}

    // List of onInit branches
    this.onInitBranches = []

    // List of onSchedule hooks
    this.onScheduleSchedules = []

    // List of onIssue events
    this.onIssueEvents = []

    // List of errors
    this.errors = []
  }

  // Parse the flow file
  parse() {
    // Only parse once
    if (this.parsed) {
      return
    }
    this.parsed = true

    // Parse the AST out of the flow path file
    const espreeOptions = {
      ecmaVersion: 'latest',
      sourceType: 'module',
      range: true,
      comment: true
    }
    const flow = fs.readFileSync(this.flowPath, 'utf8')
    const ast = espree.parse(flow, espreeOptions)

    // Get the configuration and extract workflow name
    const configDeclaration = this.getConfigDeclaration(ast)
    this.config = {
      name: this.getConfigLiteralProperty(configDeclaration, 'name')
    }

    // onInit
    this.onInitBranches = this.getOnInitBranches(ast)

    // onSchedule
    this.onScheduleSchedules = this.getOnSchedule(ast)

    // onIssue
    const doExpressions = this.getDoCallExpressions(ast)
    this.onIssueEvents = []
    for (var i = 0; i < doExpressions.length; i++) {
      const events = this.getOnIssueEvents(doExpressions[i])
      if (events) {
        for (var j = 0; j < events.length; j++) {
          this.onIssueEvents.push(events[j])
        }
      }
    }
  }

  // Return the config declaration
  getConfigDeclaration(ast) {
    const config = ast.body.find(node => {
      return (
        // node filter
        node.type === 'VariableDeclaration' &&
        // declaration filter
        node.declarations[0].type === 'VariableDeclarator' &&
        // declaration id filter
        node.declarations[0].id.type === 'Identifier' &&
        node.declarations[0].id.name === 'config' &&
        // declaration init filter
        node.declarations[0].init.type === 'ObjectExpression'
      )
    })
    if (!config) {
      this.addError('Flow is missing a top level `config` variable declaration')
      return
    }
    return config.declarations[0].init
  }

  // Return the value of a configuration property
  getConfigLiteralProperty(config, name) {
    const property = config.properties.find(property => {
      return (
        // property filter
        property.type === 'Property' &&
        property.kind === 'init' &&
        // key filter
        property.key.type === 'Identifier' &&
        property.key.name === name &&
        // value filter
        property.value.type === 'Literal'
      )
    })
    if (!property) {
      this.addError('Unable to extract required `name` property from the `config`')
      return
    }
    return property.value.value
  }

  // Return the flow expression statements
  getFlowExpressionStatements(ast) {
    return ast.body.filter(node => {
      return (
        // node filter
        node.type === 'ExpressionStatement' &&
        // expression filter
        node.expression.type === 'CallExpression' &&
        // callee filter
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.object.type === 'CallExpression' &&
        // second level callee filter
        node.expression.callee.object.callee.type === 'MemberExpression' &&
        node.expression.callee.object.callee.object.type === 'Identifier' &&
        node.expression.callee.object.callee.object.name === 'flow'
      )
    })
  }

  // Get the onInit branches
  getOnInitBranches(ast) {
    // TODO: we should refactor getOnIssueEvents and walk the tree the same way
    const branches = []
    const hooks = this.getFlowExpressionStatements(ast).filter(statement => {
      return (
        // property filter
        statement.expression.callee.object.callee.property.name === 'onInit' &&
        // arguments filter
        statement.expression.callee.object.arguments.length == 1 &&
        statement.expression.callee.object.arguments[0].type === 'Literal'
      )
    })
    hooks.forEach(statement => {
      branches.push(statement.expression.callee.object.arguments[0].value)
    })
    return branches
  }

  // Get the list of schedules that have a hook
  getOnSchedule(ast) {
    // TODO: we should refactor getOnIssueEvents and walk the tree the same way
    const schedules = []
    this.getFlowExpressionStatements(ast)
      .filter(statement => {
        return (
          // property filter
          statement.expression.callee.object.callee.property.name === 'onSchedule' &&
          // arguments filter
          statement.expression.callee.object.arguments.length == 1 &&
          statement.expression.callee.object.arguments[0].type === 'Literal'
        )
      })
      // collect schedules
      .forEach(statement => {
        schedules.push(statement.expression.callee.object.arguments[0].value)
      })

    return schedules
  }

  // Return the list of call expressions calling a do function at the top level
  // (i.e. potential flow hooks)
  getDoCallExpressions(ast) {
    const callExpressions = []
    const nodes = ast.body.filter(node => {
      return (
        // node filter
        node.type === 'ExpressionStatement' &&
        // expression filter
        node.expression.type === 'CallExpression' &&
        // callee filter
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.property.type === 'Identifier' &&
        node.expression.callee.property.name === 'do' &&
        node.expression.callee.object.type === 'CallExpression'
      )
    })
    nodes.forEach(node => {
      callExpressions.push(node.expression.callee.object)
    })
    return callExpressions
  }

  // Get the list of onIssue events for a given node
  getOnIssueEvents(node, events = []) {
    // Return events (final state)
    if (
      node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      node.object.name === 'flow' &&
      node.property.type === 'Identifier' &&
      node.property.name === 'onIssue'
    ) {
      return events
    }

    // Collect events
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'withEvent' &&
      node.arguments.length == 1 &&
      node.arguments[0].type === 'Literal'
    ) {
      events.push(node.arguments[0].value)
    }

    // Walk the tree
    if (node.type === 'CallExpression') {
      return this.getOnIssueEvents(node.callee, events)
    } else if (node.type === 'MemberExpression') {
      return this.getOnIssueEvents(node.object, events)
    }
  }

  // Add an error
  addError(error) {
    this.errors.push(error)
  }
}

// Class responsible for converting a flow into an Action workflow
class FlowCompiler {
  constructor(workflowPath, flowPath, parser) {
    this.workflowPath = workflowPath
    this.flowPath = flowPath
    this.parser = parser
  }

  // Sanitize a provided path
  sanitizePath(path) {
    if (path.indexOf('.github') != -1) {
      return path.slice(path.indexOf('.github'))
    }
    return path
  }

  compile() {
    // Init the workflow
    const workflow = {
      // Name
      name: this.parser.config.name,

      // On
      on: {}
    }

    //
    // On
    //

    // onInit
    if (this.parser.onInitBranches.length > 0) {
      workflow.on.push = {
        branches: this.parser.onInitBranches,
        paths: [this.sanitizePath(this.flowPath), this.sanitizePath(this.workflowPath)]
      }
    }

    // onSchedule
    if (this.parser.onScheduleSchedules.length > 0) {
      workflow.on.schedule = []
      for (var i = 0; i < this.parser.onScheduleSchedules.length; i++) {
        workflow.on.schedule.push({ cron: this.parser.onScheduleSchedules[i] })
      }
    }

    // onIssue
    if (this.parser.onIssueEvents.length > 0) {
      workflow.on.issues = {
        types: this.parser.onIssueEvents
      }
    }

    //
    // Jobs
    //

    workflow.jobs = {
      'elevated-flow': {
        'runs-on': 'ubuntu-latest',
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v3'
          },
          {
            name: 'Run flow',
            uses: 'yoannchaudet/elevated-flow@main',
            with: {
              path: this.sanitizePath(this.flowPath)
            }
          }
        ]
      }
    }

    // Output the workflow
    fs.writeFileSync(this.workflowPath, yaml.stringify(workflow), 'utf8')
    console.log('Workflow generated at ' + this.workflowPath)
  }
}

module.exports = { FlowParser, FlowCompiler }
