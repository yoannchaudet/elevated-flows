const config = {
  name: 'Support escalation'
}

console.log('Starting flow')

flow.onInit('main').do(async () => {
  // Run the first time (or when the workflow is edited)
  console.log('On init')
})

flow.onSchedule('*/10 * * * *').do(async () => {
  // Run on a schedule
  console.log('On schedule (every 10 min)')
})

// Add to project if needed
flow.onIssue()
  .withEvent('opened')
  .withLabel('support-escalation')
  .do(async issue => {
    console.log('On issue (opened) with label support-escalation')
    // if (!getProjectColumn(project, issue)) {
    //   setProjectColumn(project, issue, triageColumn)
    // }
  })

// Awaiting customer response
flow.onIssue()
  .withEvent('labeled')
  .withLabel('awaiting-customer')
  .do(async issue => {
    // setProjectColumn(project, issue, blockedColumn)
    console.log('On issue (labeled) with label awaiting-customer')
  })

// Back to triage
flow.onIssue()
  .withEvent('unlabeled')
  .withLabel('awaiting-customer')
  .do(async issue => {
    // setProjectColumn(project, issue, triageColumn)
    console.log('On issue (unlabeled) with label awaiting-customer')
  })

console.log('Ending flow')
