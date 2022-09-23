/**
 * Define the three supported hooks for now:
 * - OnInit: when a workflow runs for the first time or has been changed
 * - OnIssue: when an issue event is triggered
 * - OnSchedule: when a schedule event is triggered
 */

const ISSUE_TYPES = [
  'opened',
  'edited',
  'deleted',
  'transferred',
  'pinned',
  'unpinned',
  'closed',
  'reopened',
  'assigned',
  'unassigned',
  'labeled',
  'unlabeled',
  'locked',
  'unlocked',
  'milestoned',
  'demilestoned'
]

// A base hook
class Hook {
  // Ctor
  constructor(ctx) {
    this.ctx = ctx
  }

  // Save the lambda to execute if the hook is matched
  do(lambda) {
    this.lambda = lambda
  }

  // Does this hook matches the current context?
  matches() {
    return false
  }
}

class OnInit extends Hook {
  // Ctor
  constructor(ctx, defaultBranch) {
    super(ctx)
    this.defaultBranch = defaultBranch
  }

  // Does this hook matches the current context?
  matches() {
    // ⚠️ We cannot filter on anything better than the event name for now
    // TODO: cook up some artifact context here
    return this.ctx.github.eventName == 'push'
  }
}

class OnIssue extends Hook {
  // Ctor
  constructor(ctx) {
    super(ctx)
    this.types = []
    this.labels = []
  }

  // Filter event
  withEvent(type) {
    if (!ISSUE_TYPES.includes(type)) {
      throw `provided type '${type}' is invalid`
    }
    this.types.push(type)

    // Return the object to allow fluent chaining
    return this
  }

  // Filter labels
  withLabel(label) {
    this.labels.push(label)

    // Return the object to allow fluent chaining
    return this
  }

  // Does this hook matches the current context?
  matches() {
    // Validate event name
    if (this.ctx.github.eventName != 'issues') {
      return false
    }

    // Filter event
    if (this.types.length > 0 && !this.types.includes(this.ctx.github?.payload?.action)) {
      return false
    }

    // Filter label
    if (this.labels.length > 0) {
      // Labeled and unlabeled runs in the context of one specific label, so use that for the match
      if (['labeled', 'unlabeled'].includes(this.ctx.github?.payload?.action)) {
        return this.labels.includes(this.ctx.github?.payload?.label?.name) || false
      }

      // For other events, just look at the list of labels on the issue
      else {

        const github = this.ctx.github
        return this.labels.reduce((check, label) => {
          return check && github?.payload?.labels?.find(l => l.name === label) != undefined
        }, true) || false
      }
    }

    return true
  }
}

class OnSchedule extends Hook {
  constructor(ctx, schedule) {
    super(ctx)
    this.schedule = schedule
  }

  // Does this hook matches the current context?
  matches() {
    return this.ctx.github.eventName != 'schedule' && this.ctx.github.payload.schedule == this.schedule
  }
}

class Hooks {
  constructor(ctx) {
    this.ctx = ctx
    this.hooks = []

    // Init the context to be exposed to the flow
    this.hookContext = {
      onInit: branch => this.pushHook(new OnInit(this.ctx, branch)),
      onIssue: () => this.pushHook(new OnIssue(this.ctx)),
      onSchedule: schedule => this.pushHook(new OnSchedule(schedule))
    }
  }

  // Add a hook to the list and return it
  pushHook(hook) {
    this.hooks.push(hook)
    return hook
  }

  // Parse the given `github` object and call the right hook (if any)
  async do() {
    this.hooks.forEach(hook => {
      if (hook.matches()) {
        hook.lambda()
      }
    })
  }
}

module.exports = { OnInit, OnIssue, Hooks }
