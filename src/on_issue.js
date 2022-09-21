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
  'demilestoned',
]

class OnIssue {

  constructor() {
    this.types = []
  }

  // Filter the type of issue events
  type(type) {
    // Validate type
    if (ISSUE_TYPES.includes(type)) {
      throw `provided type '${type}' is invalid`
    }

    // Add it to the list
    this.types.push(type)

    // Return the object to allow fluent chaining
    return this
  }

  do(lambda) {
    // TODO: get the current issue and or iterate as needed

    // Don't return anything (final fluent state)
  }

}

module.exports = { OnIssue }