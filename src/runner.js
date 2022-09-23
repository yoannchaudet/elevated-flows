const process = require('process')
const vm = require('vm')
const fs = require('fs')
const path = require('path')

class Runner {
  constructor(flowPath) {
    this.flowPath = flowPath
  }

  run() {
    // Test flow file
    if (!fs.existsSync(this.flowPath)) {
      throw `Flow file not found: ${this.flowPath}`
    }

    // Create a context for the flow
    const context = {
      process: process
    }
    vm.createContext(context)

    // Create a script from the flow
    const flow = fs.readFileSync(this.flowPath, 'utf8')
    const flowWrapper = `
    'use strict';
    (async () => {
      try {
        ${flow};
      } catch(e) {
        console.error('Flow error', e)
        process.exit(1)
      }
    })();
`
    const flowScript = new vm.Script(flowWrapper, {
      filename: path.parse(this.flowPath).base
    })

    // Run the flow
    flowScript.runInContext(context, {
      // TODO: add timeout
      displayErrors: true,
      breakOnSigint: true
    })
  }
}

module.exports = { Runner }