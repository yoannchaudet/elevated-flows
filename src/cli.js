#!/usr/bin/env node
const yargs = require('yargs')
const { Runner } = require('./runner')

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
  // .command(
  //   'compile flow-path',
  //   'Compile the given flow',
  //   yargs => {
  //     yargs.positional('flow-path', {
  //       type: 'string',
  //       describe: 'Path to the flow to compile',
  //       demandOption: true
  //     })
  //   },
  //   argv => {
  //     // COMPILE x
  //   }
  // )

  .help()
  .demandCommand(1).argv
