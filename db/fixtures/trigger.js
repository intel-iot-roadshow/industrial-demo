var trigger_fixtures = {

    valid_1 : {
        id : "FanOn",
        name : "FanOn",
        sensor_id : "Temperature",
        actuator_id : "Fan",
        validator_id : "Sound",
        condition : ">80",
        triggerFunc: "on",
        active: true
    },


    fan_on_condition_true : {
        id : "FanOnTrue",
        name : "FanOn",
        sensor_id : "Temperature",
        actuator_id : "Fan",
        validator_id : "Sound",
        condition : "( function() { return true; } )",
        triggerFunc: "on",
        active: true
    },


    fan_on_condition_false : {
        id : "FanOnTrue",
        name : "FanOn",
        sensor_id : "Temperature",
        actuator_id : "Fan",
        validator_id : "Sound",
        condition : "( function() { return false; } )",
        triggerFunc: "on",
        active: true
    },

    fan_on_condition_passes_argument : {
        id : "FanOnTrue",
        name : "FanOn",
        sensor_id : "temperature",
        actuator_id : "fan",
        validator_id : "sound",
        condition : "( function(arg) { return arg; } )",
        triggerFunc: "on",
        active: true
    },

    temperature_greater_than_27 : {
        id : "FanOnTrue",
        name : "FanOn",
        sensor_id : "temperature",
        actuator_id : "fan",
        validator_id : "sound",
        condition : "( function(temperature) { return temperature > 27; } )",
        triggerFunc: "on",
        active: true
    },

    temperature_less_than_20 : {
        id : "FanOnTrue",
        name : "FanOn",
        sensor_id : "temperature",
        actuator_id : "fan",
        validator_id : "sound",
        condition : "( function(temperature) { return temperature < 20; } )",
        triggerFunc: "on",
        active: true
    }

};

module.exports = trigger_fixtures;
