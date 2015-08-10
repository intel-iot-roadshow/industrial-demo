'use strict';
var util = require('util');
var mraa = require('mraa');
var crypto = require('crypto');


var relay = require("../../relay.json");
var pin = relay.pin;

var led = new mraa.Gpio(relay.pin); 
led.dir(mraa.DIR_OUT);

var deviceId = crypto.createHash('md5').update(relay.description).digest('hex');

module.exports = {
  relay: relay
};

function relay(req, res) {
   
  var requestedDeviceId = req.swagger.params.deviceId.value;
  var requestedAction = req.swagger.params.action.value;
	if (requestedDeviceId  === deviceId  ){
      if (requestedAction === "on"){
        led.write(1);
         res.json("Success");
      }
      if (requestedAction === "off"){
        led.write(0);
         res.json("Success");
      }
		   res.json("Action Undefined");
	}
  res.json("Device Id is not found");
}
