var AWS = require("aws-sdk");

AWS.config.update({
  region: 'us-east-1'
})
var docClient = new AWS.DynamoDB.DocumentClient();

exports.saveConnEntry= async(event) => {

  const userArn = event['detail']['userIdentity']['arn']
  const eventName = event['detail']['eventName']
  const connectorArn = event['detail']['responseElements']['connectorProfileArn']

  await this.saveEntry(`${eventName}=${connectorArn}`, userArn)
}

exports.saveEntry= async(pk, owner) => {
  var params = {
    TableName:'appflow-compliance-lock',
    Item:{
        pk,
        "sk": '1',
        owner
    }
  };

  try {
    console.log(`About to insert into db-${JSON.stringify(params)}`)
    const data = await docClient.put(params).promise()
    console.log("Added item:", JSON.stringify(data, null, 2));
  } catch(error) {
    console.error("Unable to add item. Error JSON:", JSON.stringify(error, null, 2));
  }
}

exports.findEntry = async(event) => {
  const eventName = event['detail']['eventName']
  const connectorArn = event['detail']['responseElements']['connectorProfileArn']

  return findEntry(eventName, connectorArn)
}

exports.findEntry = async(eventName, connectorArn) => {
  var params = {
    TableName:'appflow-compliance-lock',
    Key:{
        "pk": `${eventName}=${connectorArn}`,
        "sk": '1'
    }
  };
  try {
    console.log(`Looking for db item-${JSON.stringify(params)}`)
    const data = await docClient.get(params).promise()
    console.log("Found item:", JSON.stringify(data, null, 2));
    return data;
  } catch(error) {
    console.error("Unable to add item. Error JSON:", JSON.stringify(error, null, 2));
    return undefined;
  }  
}


