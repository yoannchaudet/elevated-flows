require('process')
const vm = require('vm')
const fs = require('fs')
const path = require('path')

// Take the args
const args = process.argv.slice(2)

// Validate argument
if (args.length != 1) {
  throw `Expected 1 argument, provided ${args.length}`
}

// Create a context for the flow
const context = {
  process: process
}
vm.createContext(context)

// Create a script from the flow
const flow = fs.readFileSync(args[0], 'utf8')
const flowWrapper = `
  'use strict';
  (async () => {
    try {
      ${flow};
    } catch(e) {
      console.error('Flow error', e)
      process.exit(1)
    }
  })()
`
const flowScript = new vm.Script(flowWrapper, {
  filename: path.parse(args[0]).base
})

// Run the flow
flowScript.runInContext(context)
