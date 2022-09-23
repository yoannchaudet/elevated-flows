const config = {
  name: 'Support escalation',
}

onInit().do(async () => {
  // Run the first time (or when the workflow is edited)
})

onSchedule('').do(async () =>{
  // Run on a schedule
})

// Add to project if needed
await onIssue()
  .type('opened')
  .withLabel('support-escalation')
  .do(async issue => {
    if (!getProjectColumn(project, issue)) {
      setProjectColumn(project, issue, triageColumn)
    }
  })

// Awaiting customer response
await onIssue()
  .type('labeled')
  .withLabel('awaiting-customer')
  .do(async issue => {
    setProjectColumn(project, issue, blockedColumn)
  })

// Back to triage
await onIssue()
  .type('unlabeled')
  .withLabel('awaiting-customer')
  .do(async issue => {
    setProjectColumn(project, issue, triageColumn)
  })
