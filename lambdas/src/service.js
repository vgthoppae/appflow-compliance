const persistence = require('./persistence')
var AWS = require("aws-sdk");
AWS.config.update({
  region: 'us-east-1'
})
const appflow = new AWS.Appflow();

exports.flowCreated = async (event) => {
  const flowDef = await getFlowDefinition(event)
  const flowOwnerArn = event['detail']['userIdentity']['arn']

  const destination = flowDef['destinationFlowConfigList'][0]
  
  if (destination['connectorType'] == 'S3') {
    await persistS3TargetPrefixOwnership(destination, flowOwnerArn)
  }

  if (destination['connectorType'] == 'Redshift') {
    const destinationConnArn = await getConnectionProfileArn(destination)
    const item = await persistence.findEntry('CreateConnectorProfile', destinationConnArn)
    if (item) { //this connection is being used - see if it is the same owner
      const connOwner = item['Item']['owner']

      if (connOwner != flowOwnerArn) {
        console.log('Different owner - deleting the flow')
        await deleteFlow(flowDef['flowName'])
      } else {
        console.log('Same owner - no action needed')
      }
      console.log(item)
    }
  }
}
  
const persistS3TargetPrefixOwnership = async(destination, flowOwnerArn) => {
  const s3props = destination['destinationConnectorProperties']['S3']
  const bucketName = s3props['bucketName']
  const bucketPrefix = s3props['bucketPrefix']
  const fullS3Loc = `${bucketName}/${bucketPrefix}`

  await persistence.saveEntry(`S3TargetLoc=${fullS3Loc}`, flowOwnerArn)
}

const getFlowDefinition = async(event) => {
  const flowArn = event['detail']['responseElements']['flowArn']
  const flowName = flowArn.substring(flowArn.indexOf('/')+1)
  console.log(flowArn)
  console.log(flowName)

  var params = {
    flowName
  }

  return await appflow.describeFlow(params).promise();
}

const getConnectionProfileArn = async(connection) => {
  const connectorType = connection['connectorType']
  const connectorProfileName = connection['connectorProfileName']

  console.log(connectorProfileName)

  var params = {
    connectorProfileNames: [connectorProfileName],
    connectorType: connectorType
  }

  const connProfile = await appflow.describeConnectorProfiles(params).promise();
  connProfileArn = connProfile['connectorProfileDetails'][0]['connectorProfileArn']
  return connProfileArn
}

const deleteFlow = async(flowName) => {
  var params = {
    flowName,
    forceDelete: true
  }
  try{
    await appflow.deleteFlow(params).promise();
    console.log('Flow delete successfully')
  } catch(err) {
    console.log(`Error deleting Flow-${err}`)
  }

}