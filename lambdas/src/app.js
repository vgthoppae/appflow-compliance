// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const persistence = require('./persistence')
const service = require('./service')

const CREATE_CONN_PROFILE = 'CreateConnectorProfile'
const CREATE_FLOW = 'CreateFlow'
const SUPPORTED_EVENTS = [CREATE_CONN_PROFILE, CREATE_FLOW]

exports.lambdaHandler = async (event, context) => {
    try {
        let event_obj = event
        if (typeof event == 'string') {
            event_obj = JSON.parse(event)
        }

        const currentEvent = getEventOfInterest(event_obj)
        if (currentEvent) {
            console.log(`Processing event ${currentEvent}`)
            if (currentEvent == CREATE_CONN_PROFILE) {
                await persistence.saveConnEntry(event_obj)
            } else if (currentEvent == CREATE_FLOW) {
                // await persistence.findEntry(event_obj)
                await service.flowCreated(event_obj)
            }
        } else {
            console.log(`Not interested in this event-${currentEvent}`)
        }
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Completed',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

function getEventOfInterest (event) {
    if (event['detail']['eventSource'] == 'appflow.amazonaws.com' && 
        SUPPORTED_EVENTS.includes(event['detail']['eventName'])) {
        return event['detail']['eventName']
    }
    return event['detail']['eventName']
}
