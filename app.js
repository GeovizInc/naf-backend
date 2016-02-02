'use strict';
var express = require('express');
var app = express();
var db = require('./app/utils/db');
var middleware = require('./app/utils/middleware');
var config = require('./app/config');
var routes = require('./app/routes');


db.connect();
app = middleware.setup(app);

app.listen(config.port, function() {
    console.log('Listening ' + config.port + '...');
});

routes.setup(app);

module.exports = app;