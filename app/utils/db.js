var config = require('../config');
var mongoose = require('mongoose');

module.exports.connect = connect;

function connect() {
    var option = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };
    mongoose.connect(config.database, option);
}