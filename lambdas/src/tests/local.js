const fs = require('fs')

const app = require('../app')

fs.readFile('./appflow-compliance/lambdas/events/appflow-create-flow-event.json', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  app.lambdaHandler(data, {})
})