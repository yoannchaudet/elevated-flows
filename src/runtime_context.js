// Runtime context for a flow
class RuntimeContext {
  constructor(config, github) {
    // The flow configuration object (which contains extra things injected at compile time)
    this.config = config

    // The GitHub context (in Actions)
    this.github = github
  }
}

module.exports = { RuntimeContext }
