var AWS = require("aws-sdk");
AWS.config.update({
  region: 'us-east-1'
})
const appflow = new AWS.Appflow();

var params = {
  connectorProfileName: 'ared-conn', /* required */
  connectorType: 'Redshift', /* required */  
  connectionMode: 'Public', /* required */
  connectorProfileConfig: { /* required */
    connectorProfileCredentials: { /* required */
      Redshift: {
        password: 'Passw0rd.', /* required */
        username: 'awsuser' /* required */
      },
    },
    connectorProfileProperties: { /* required */
      Redshift: {
        bucketName: 'sbabsdev-s3bucket-out', /* required */
        databaseUrl: 'jdbc:redshift://redshift-cluster-1.cxyttkggsqeu.us-east-1.redshift.amazonaws.com:5439/dev', /* required */
        roleArn: 'arn:aws:iam::770382975654:role/redshift-custom-access', /* required */
        bucketPrefix: 'temp'
      },
    }
  }
};

appflow.createConnectorProfile(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});