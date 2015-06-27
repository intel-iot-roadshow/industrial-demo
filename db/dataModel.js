var sqlite3 = require('sqlite3').verbose();
var _ = require("lodash");

var DataModel = function(db, data) {

    this.data = data;
    this.db = db;

    // INSERT INTO "main"."data" ("sensor_id","value") VALUES (?1,?2)
    this.save = function() {
        console.log(this.data);
        this.db.run("BEGIN TRANSACTION");
        this.db.run('INSERT INTO "main"."data" ("sensor_id","value") VALUES (?1,?2)', [this.data.sensor_id, this.data.value]  );
        this.db.run("END");
    };

    //this.find_by_id = function(condition) {
    //     this.db.each("SELECT * FROM sensors WHERE id = ?", condition, function(err, row) {
    //         console.log(row);
    //         console.log("--------------");
    //     });
    // };


    //this.find_by_id = function(condition) {
    //     this.db.each("SELECT * FROM sensors WHERE id = ?", condition, function(err, row) {
    //         console.log(row);
    //         console.log("--------------");
    //     });
    // };

    this.find = function(callback) {
        var sql = "SELECT * FROM data";

        this.db.all(sql,  function(err, results) {
            if (err) {
                callback(err, results);
            } else {
                //                delete_by_sensor_id(
                callback(null, results);
            }
        });
    };


    this.find_by_sensor_id = function(sensor_id, callback) {
        var sql = "SELECT * FROM data WHERE sensor_id = '" + sensor_id + "'";

        this.db.all(sql,  function(err, results) {
            if (err) {
                callback(err, results);
            } else {
//                delete_by_sensor_id(
                callback(null, results);
            }
        });
    };

    this.delete_by_sensor_id = function(id) {
        this.db.run("BEGIN TRANSACTION");
        this.db.run("DELETE from sensors WHERE id = ?", id);
        this.db.run("END");
    };
};

module.exports = DataModel;

// var sensor = new ValueModel(dbconnection,
//     {
//         id : "3",
//         name : "Sound Sensor",
//         description : "read the noise",
//         maxfrequency : "200",
//         frequency : "1000",
//         active : "true",
//         ioType : "Analog"
//     });

// //sensor.save();
// sensor.find_by_sensor_id('b506768ce1e2353fe063d344e89e53e5');

// //sensor.find_by_id(3);

// sensor.update(
//     {
//         id : "3",
//         name : "Sound Sensor",
//         description : "read the ambient noise har har har",
//         maxfrequency : "200",
//         frequency : "1000",
//         active : "true",
//         ioType : "Analog"
//     }
// );
// //sensor.delete_by_id(3);

// this.db.close();
