#!/usr/bin/env node
const { parse } = require('yargs')
const yargs = require('yargs')
const { FlowParser, FlowCompiler } = require('./compiler')
const { Runner } = require('./runner')
const path = require('path')

yargs
  .scriptName('eflow')
  .usage('$0 <cmd> [args]')

  // RUN command
  .command(
    'run flow-path',
    'Run the given flow',
    yargs => {
      yargs.positional('flow-path', {
        type: 'string',
        describe: 'Path to the flow to run',
        demandOption: true
      })
    },
    argv => {
      new Runner(argv.flowPath).run()
    }
  )

  // COMPILE command
  .command(
    'compile flow-path',
    'Compile the given flow',
    yargs => {
      yargs.positional('flow-path', {
        type: 'string',
        describe: 'Path to the flow to compile',
        demandOption: true
      })
    },
    argv => {
      // Parse the supplied flow
      const parser = new FlowParser(argv.flowPath)
      parser.parse()

      // Print errors and exit
      if (parser.errors.length > 0) {
        console.error('Flow errors:')
        for (var i = 0; i < parse.errors.length; i++) {
          console.error(`  - ${parse.errors[i]}`)
        }
        process.exit(1)
      }

      // Compile the Actions workflow
      const workflowPath = path.join(
        path.dirname(path.dirname(argv.flowPath)),
        'workflows',
        path.basename(argv.flowPath, path.extname(argv.flowPath)) + '.yml'
      )
      const compiler = new FlowCompiler(workflowPath, argv.flowPath, parser)
      compiler.compile()
    }
  )

  .help()
  .demandCommand(1).argv
