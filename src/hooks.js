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

class OnInit {
  constructor(ctx, defaultBranch) {
    this.ctx = ctx
    this.defaultBranch = defaultBranch
  }

  // ⚠️ We cannot filter on anything better than the event name
  matches() {
    return this.ctx.github.eventName == 'push'
  }

  async do(lambda) {
    this.lambda = lambda
  }
}

class OnIssue {
  constructor(ctx) {
    this.ctx = ctx
    this.types = []
    this.labels = []
  }

  // Filter event types
  type(type) {
    if (ISSUE_TYPES.includes(type)) {
      throw `provided type '${type}' is invalid`
    }
    this.types.push(type)

    // Return the object to allow fluent chaining
    return this
  }

  // Filter labels
  label(label) {
    this.labels.push(label)

    // Return the object to allow fluent chaining
    return this
  }

  // Matches event
  matches() {
    // Validate event name
    if (this.ctx.github.eventName != 'issues') {
      return false
    }

    // Filter label
    if (this.labels.length > 0) {
      if (['labeled', 'unlabeled'].includes(this.ctx.github.payload.action)) {
        return this.labels.includes(this.ctx.github.payload.label.name)
      } else {
        for (var i = 0; i < this.ctx.github.payload.labels.length; i++) {
          if (this.labels.includes(this.ctx.github.payload.label.name)) {
            return true
          }
        }
        return false
      }
    }

    return true
  }

  async do(lambda) {
    this.lambda = lambda
  }
}

class OnSchedule {
  constructor(ctx, schedule) {
    this.ctx = ctx
    this.schedule = schedule
  }

  async do(lambda) {}
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

module.exports = { Hooks }
