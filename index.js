
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const Constants = require("./constants");
const DEFAULT_CLUSTER_GROUP = Constants.DEFAULT_CLUSTER_GROUP;
const DEFAULT_AWS_REGION = Constants.DEFAULT_AWS_REGION;
const DEFAULT_AWS_SSH_KEY = Constants.DEFAULT_AWS_SSH_KEY;
const BASE_TMC_URL = Constants.BASE_TMC_URL;
const DEFAULT_POD_CIDR = Constants.DEFAULT_POD_CIDR;
const DEFAULT_SERVICE_CIDR = Constants.DEFAULT_SERVICE_CIDR;
const DEFAULT_VPC_CIDR = Constants.DEFAULT_VPC_CIDR;
const PA_OWNER = Constants.PA_OWNER;
const TMC_TOKEN = Constants.TMC_TOKEN;
let clusterName = "";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'I am connected to the Tanzu Mission Control Backend. What can I do for you?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CreateClusterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateCluster';
    },
    handle(handlerInput) {
        clusterName = handlerInput.requestEnvelope.request.intent.slots.name.value.toLowerCase();

        const speakOutput = `You got it! I will create a new Tanzu Cluster called ${clusterName} for you! What plan should I use? `;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ClusterPlanIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClusterPlan';
    },
    handle(handlerInput) {
        const clusterPlan = handlerInput.requestEnvelope.request.intent.slots.plan.value.toLowerCase();
        let speakOutput = `Sit tight! I am creating cluster ${clusterName}`;
        
        const payload = {"cluster":{"full_name":{"name":clusterName,"location":"global"},"object_meta":{"group":DEFAULT_CLUSTER_GROUP,"description":"","labels":{"iaas":"aws","mode":"alexa"}},"spec":{"provisionedcluster":{"high_availability":clusterPlan === "prod" ? true : false,"network_config":{"pod_cidr":DEFAULT_POD_CIDR,"service_cidr": DEFAULT_SERVICE_CIDR},"cloud_provider_config":{"aws_config":{"control_plane_vm_flavor":"m5.large","ssh_key_name":DEFAULT_AWS_SSH_KEY,"region":DEFAULT_AWS_REGION,"az_list":["us-east-1a"],"network_spec":{"vpc":{"cidr_block": DEFAULT_VPC_CIDR}}}},"version":"1.18.5-1-amazon2","node_pool":[{"full_name":{"name":"default-node-pool","location":"global","cluster_name":clusterName,"provisionedcluster_name":clusterName},"spec":{"cloud_provider_config":{"aws_config":{"instance_type":"m5.large","zone":["us-east-1a"]}},"worker_node_count":"1","version":"1.18.5-1-amazon2"}}],"account_name": PA_OWNER}}}};
        
        const url = `${BASE_TMC_URL}/clusters`;
        const token = `Bearer ${TMC_TOKEN}`;

        axios({
          method: 'post',
          url,
          data: payload,
          headers: {
            'Authorization': token
          }
        }).then((res) => {
            console.log(`Request successful for creating cluster ${clusterName}`);
        }).catch((err) => {
            console.error(`errerrrrrrr creating cluster ${clusterName} - ` + err);
            console.log(`debug data for ${clusterName} - ` + JSON.stringify(payload));
        });
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const  UpgradesAvailableIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UpgradesAvailable';
    },
    handle(handlerInput) {
        clusterName = handlerInput.requestEnvelope.request.intent.slots.clusterName.value.toLowerCase();
        let alexaResponse = "";
        
        return getAvailableUpgrades(clusterName)
        .then((availableUpgrades) => {
            alexaResponse = `There are ${availableUpgrades.length} upgrades available - ${availableUpgrades.map(v => v.name).join(",")}`;
            return handlerInput.responseBuilder.speak(alexaResponse).reprompt(alexaResponse).getResponse();
        }).catch((err) => {
           console.error(`errerrrrrrr getting available upgrades for cluster ${clusterName}`, err);
           alexaResponse = `Hmm..Something went wrong with that request`;
           return handlerInput.responseBuilder.speak(alexaResponse).reprompt(alexaResponse).getResponse();
        });
        
    }
};

const getAvailableUpgrades = async function (clusterName) {
    const apiURL = `${BASE_TMC_URL}/clusters/somename/provisionedclusters/${clusterName}/versions?full_name.location=global`;
    const apiToken = `Bearer ${TMC_TOKEN}`;
    let versionsAvailable = [];
    
    const apiResponse = await axios({
          method: 'get',
          url: apiURL,
          headers: {
            'Authorization': apiToken
          }
    });
    
    versionsAvailable = Object.keys(apiResponse.data) && Object.values(apiResponse.data.versions) ? apiResponse.data.versions : [];
    return versionsAvailable;
}

const RunInspectionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RunInspection';
    },
    handle(handlerInput) {
        clusterName = handlerInput.requestEnvelope.request.intent.slots.clusterName.value.toLowerCase();

        const apiURL = `${BASE_TMC_URL}/clusters/${clusterName}/inspections`;
        const apiToken = `Bearer ${TMC_TOKEN}`;
        const apiPayload = {"inspection":{"full_name":{"cluster_name": clusterName,"location":"global"},"spec":{"lite_spec":{}}}}
        
        axios({
              method: 'post',
              url: apiURL,
              data: apiPayload,
              headers: {
                'Authorization': apiToken
              }
        }).then((res) => {
            console.log(`running inspection for cluster ${clusterName}`);
        }).catch((err) => {
            console.error(`errerrrrrrr running inpsection for ${clusterName} - `, err);
            
        });
        const alexaResponse = `Running inspection for cluster ${clusterName}`;
        return handlerInput.responseBuilder
            .speak(alexaResponse)
            .reprompt(alexaResponse)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateClusterIntentHandler,
        ClusterPlanIntentHandler,
        UpgradesAvailableIntentHandler,
        RunInspectionIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

