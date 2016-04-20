'use strict';
var express = require('express');
var app = express();
var db = require('./app/utils/db');
var middleware = require('./app/utils/middleware');
var config = require('./app/config');
var routes = require('./app/routes');
var jwt = require('jsonwebtoken');


db.connect();
middleware.setup(app);

app.listen(config.port, function() {
    console.log('Listening ' + config.port + '...');
});


routes.setup(app);

app.use('/static', express.static(__dirname + '/public'));


app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
    next();
});



module.exports = app;