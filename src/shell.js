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
const context = {}
vm.createContext(context)

// Create a script from the flow
const flow = fs.readFileSync(args[0], 'utf8')
const flowScript = new vm.Script(flow, {
  filename: path.parse(args[0]).base
})

// Run the flow
flowScript.runInContext(context)
