const core = require('@actions/core')
const { Runner } = require('./runner')

// Get inputs
const flowPath = core.getInput('path')

// Run the flow
new Runner(flowPath).run()
