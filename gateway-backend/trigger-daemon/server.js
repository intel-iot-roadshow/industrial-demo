//This daemon listens to all data streams, and checks for particular trigger
//conditions as needed.
var mqtt = require('mqtt');
var mongoose = require('mongoose');
var _ = require("lodash"); //Library needed for data paring work.
var config = require("./config.json"); //Configuration information

// Import the Database Model Objects
//var DataModel = require('intel-commerical-iot-database-models').DataModel;
//var SensorCloudModel = require('intel-commerical-iot-database-models').SensorCloudModel;
var TriggerModel = require('intel-commerical-iot-database-models').TriggerModel;
// var errorModel = require('intel-commerical-iot-database-models').ErrorModel;

// // Setup the models which can interact with the database
// //var sensorCloudModel = new SensorCloudModel(db);
// //var dataModel = new DataModel(db);
// var triggerModel = new TriggerModel(db);

// var triggers = [];
// var triggers_by_sensor_id = [];

var logger = require('./logger.js');

logger.info("Trigger Daemon is starting...");

if(config.debug.level != "true") {
    logger.transports.file.level = 'error';
    logger.transports.console.level = 'error';
}

// Import the Utilities functions
var utils = require("./utils.js");

var TriggerDaemon = function (config, logger) {
    var self = this;
    self.logger = logger;
    self.logger.trace("Hello");

    var default_config = {
        "mqtt" : {
            "uri" : "mqtt://localhost"
        },

        "mongodb" : {
            "uri" : "mongodb://localhost/iotdemo"
        },

        "debug" : {
            "level" : "error"
        }
    };

    // Set default properties of the Trigger Daemon
    self.config = config || default_config;

    self.start = function () {};

    self.triggers = [];
    self.stash = [];

    // Connect to the MQTT server
    self.mqttClient  = mqtt.connect(self.config.mqtt.uri);

    // Connect to the MongoDB server
    var db = mongoose.createConnection(self.config.mongodb.uri);

    // Save the MongoDB client instance to a property in
    // the Trigger Daemon object
    self.mongodb_client = db;

    //var mongodb_connected;
//    db.on('error', console.error.bind(console, 'connection error:'));
    // db.on('error', function(err) {
    //     throw(err);
    // });

    self.close = function() {
        self.closeMQTT();
        self.closeMongoDB();
    };

    self.closeMQTT = function() {
      //  self.mqttClient.end();
    };

    self.closeMongoDB = function () {
      //  console.log("Mongoose Disconnecting");
        mongoose.disconnect();
    };

    db.once('open', function () {
        //console.log("Connection to MongoDB opened");
    });

    self.addTrigger = function (triggerJSON) {
        var trigger = new TriggerModel(triggerJSON);
        self.triggers.push(trigger);

//        self.triggers_by_sensor_id = _.groupBy(triggerFuncs, "sensor_id");
        // trigger.save(function(err) {
        //     if (err) throw(err);
        // });
    };

    // On the start of a connection, do the following...
    self.mqttClient.on('connect', function () {
        self.logger.info("Connected to MQTT server");
        self.mqttClient.subscribe('trigger/refresh');
        self.mqttClient.subscribe('trigger/data');
        self.mqttClient.subscribe('sensors/+/data');
        self.mqttClient.publish('trigger/refresh', '{"refresh" : "true"}');
    });


    // Every time a new message is received, do the following
    self.mqttClient.on('message', function (topic, message) {
        self.logger.trace(topic + ":" + message);
        var json;

        // Parse incoming JSON and print an error if JSON is bad
        try {
            json = JSON.parse(message);
        } catch(error) {
            self.logger.error("Malformated JSON received: " + message);
        }

        // Determine which topic Command Dispatcher
        if (utils.isSensorTopic(topic)) {
            // Received a message on a Sensor MQTT topic
            self.processSensorData(json);
        }

        // else if (utils.isRefreshTopic(topic)) {
        //     // Received a message on the Refresh MQTT topic
        //     processRefresh(json);
        // } else if (utils.isTriggerTopic(topic)) {
        //     // Received a message on the Trigger MQTT topic
        //     processTriggers(json);
        // }
    });

    self.filter_triggers_by_sensor_id = function(id) {
        return _.filter(self.triggers, {sensor_id : id});
    };

    self.processSensorData = function(json) {
        var sensor_id = json.sensor_id;
        var value = json.value;

        // Loop through all of the triggers for the sensor which
        // is sending this incoming sensor data.

        self.stash[sensor_id] = value;

        _.forEach(
            self.filter_triggers_by_sensor_id(
                sensor_id
            ),

            // Check if the triggers predicate evaluates to true
            function(trigger) {
                if (trigger.eval_condition(self, value)) {
                    trigger.eval_triggerFunc(self);
                }
            });
     };
};

// // Every time a new message is received, do the following
// mqttClient.on('message', function (topic, message) {
//     self.logger.trace(topic + ":" + message);
//     var json;

//     // Parse incoming JSON and print an error if JSON is bad
//     try {
//         json = JSON.parse(message);
//     } catch(error) {
//         self.logger.error("Malformated JSON received: " + message);
//     }

//     // Determine which topic Command Dispatcher
//     if (utils.isSensorTopic(topic)) {
//         // Received a message on a Sensor MQTT topic
//         processSensorData(json);
//     } else if (utils.isRefreshTopic(topic)) {
//         // Received a message on the Refresh MQTT topic
//         processRefresh(json);
//     } else if (utils.isTriggerTopic(topic)) {
//         // Received a message on the Trigger MQTT topic
//         processTriggers(json);
//     }

// });

// function processTriggers(triggers) {
//     self.logger.info("Received a message on the Trigger MQTT topic");
//     self.logger.info(triggers);
//     var triggerFuncs = _.map(triggers, function(element) {

//         self.logger.info("element.condition: " + element.condition);
//         var op = element.condition.match(/[<>=]+/);
//         var triggerValue = element.condition.match(/\d+/);

//         if (op == "" || triggerValue == "") {
//             self.logger.error("SyntaxError: with op or triggerValue");
//             return;
//         }
//         var fcond = compareFuncBuilder(op, triggerValue);
//         return _.extend({}, element, {condfunc: fcond});
//     });

//     triggers_by_sensor_id = _.groupBy(triggerFuncs, "sensor_id");
//     self.logger.debug(triggers_by_sensor_id);
// }

// function processRefresh(json) {
//     // Message recieved on the refresh topic
//     self.logger.info("Received a message on the Refresh MQTT topic");


//     TriggerModel.find({}, function (err, results) {
//         if (err) {
//             self.logger.error("Error in fetching triggers from the database");
//         } else {
//             self.logger.info("Publishing new triggers from db");
//             mqttClient.publish('trigger/data', JSON.stringify(results));
//         }
//     });
// }

// function processSensorData(json) {
//     var sensor_id = json.sensor_id;
//     var value = json.value;

//     // Loop through all of the triggers for the sensor which
//     // is sending this incoming sensor data.
//     _.forEach(
//         triggers_by_sensor_id[sensor_id],

//         // Check if the triggers predicate evaluates to true
//         function(trigger) {
//             if (trigger.condfunc(value)) {
//                 self.logger.info("Trigger has fired!  " + trigger.name);

//                 // Build the topic string for the actuator that is notified
//                 var actuatorTopic = 'actuator/' + trigger.actuator_id + '/trigger';

//                 // Send a response to the actuator
//                 mqttClient.publish(actuatorTopic, trigger.triggerFunc);

//                 //DATA CHECKS GO HERE!
//             }
//         });
// }

// function compareFuncBuilder(operator, triggerValue) {
//     return function (sensorValue) {
//         var functionStr = sensorValue + operator + triggerValue;
//         return eval(functionStr);
//     };
// }

module.exports = TriggerDaemon;

new TriggerDaemon(config, logger);
