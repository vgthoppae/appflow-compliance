var AWS = require("aws-sdk");
AWS.config.update({
  region: 'us-east-1'
})
const appflow = new AWS.Appflow();

var params = {
  flowName: 'demo-flow', /* required */
  sourceFlowConfig: { /* required */
    connectorType: 'S3',
    sourceConnectorProperties: { /* required */
      S3: {
        bucketName: 'sbabsdev-s3bucket-out', /* required */
        bucketPrefix: 'appflow-stuff/light-emp'
      }
    }
  },  
  destinationFlowConfigList: [ /* required */
    {
      connectorType: 'Redshift' ,
      connectorProfileName: 'emp-redshift-conn',
      destinationConnectorProperties: { /* required */
        Redshift: {
          object: 'appflow.emp', /* required */
          intermediateBucketName: 'sbabsdev-s3bucket-out', /* required */
          bucketPrefix: 'temp',
          errorHandlingConfig: {
            failOnFirstDestinationError: true
          }
        }
      }
    },
  ],
  tasks: [ /* required */
    {
      sourceFields: [ /* required */
        'pk',
        'name'
      ],
      taskType: 'Filter',
      connectorOperator: {
        S3: 'PROJECTION'
      },
      taskProperties: {}
    },
    {
      sourceFields: [ /* required */
        'pk'
      ],
      taskType: 'Map',
      connectorOperator: {
        S3: 'NO_OP'
      },
      destinationField: 'empid',
      taskProperties: {
        DESTINATION_DATA_TYPE: 'character varying'
      }
    },    
    {
      sourceFields: [ /* required */
        'name'
      ],
      taskType: 'Map',
      connectorOperator: {
        S3: 'NO_OP'
      },
      destinationField: 'empname',
      taskProperties: {
        DESTINATION_DATA_TYPE: 'character varying'
      }
    }    
  ],
  triggerConfig: { /* required */
    triggerType: 'OnDemand'
  },
  description: 'Flow from script',
};

appflow.createFlow(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});