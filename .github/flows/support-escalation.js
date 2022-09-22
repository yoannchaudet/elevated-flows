const config = {
  name: 'Support escalation',
}

await onInit().do({
  // Run the first time (or when the workflow is edited)
})

await onSchedule('').do({
  // Run on a schedule
})

// Add to project if needed
await onIssue()
  .type('opened')
  .withLabel('support-escalation')
  .do(issue => {
    if (!getProjectColumn(project, issue)) {
      setProjectColumn(project, issue, triageColumn)
    }
  })

// Awaiting customer response
await onIssue()
  .type('labeled')
  .withLabel('awaiting-customer')
  .do(issue => {
    setProjectColumn(project, issue, blockedColumn)
  })

// Back to triage
await onIssue()
  .type('unlabeled')
  .withLabel('awaiting-customer')
  .do(issue => {
    setProjectColumn(project, issue, triageColumn)
  })

// const main = async () => {
//   // we can define variables here, it's regular code
//   const project = 'github/pages-engineering'
//   const triageColumn = 'On-call Triage'
//   const blockedColumn = 'Blocked'

//   // fluent syntax (must be top level)
//   onIssue()
//     .type('opened')
//     .do(issue => {
//       if (!issue.labels.includes('support-escalation')) {
//         return
//       }

//       // Initial state -> Triage column
//       if (!getProjectColumn(project, issue)) {
//         setProjectColumn(project, issue, triageColumn)
//       }

//       // Awaiting customer -> blocked
//       if (getLabel(issue, 'awaiting_customer_escalation') && !getState(issue, 'awaiting')) {
//         setState(issue, 'awaiting', DateTime.now)
//         setProjectColumn(project, issue, blockedColumn)
//       }

//       if (
//         (getLabel(issue, 'awaiting_customer_escalation') && getState(issue, 'awaiting') < getLastComment(issue).date) ||
//         !getLabel(issue, 'awaiting_customer_escalation')
//       ) {
//         setProjectColumn(project, issue, triage_column)
//         removeLabel(issuem, 'awaiting_customer_escalation')
//         setState(issue, 'awaiting', null)
//       }
//     })
// }
