'use strict';
var config = require('../config');
var credential = require('../controllers/credential.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/auth/email/:email', credential.check);
    app.post(apiPrefix + '/auth/register', credential.register);
    app.post(apiPrefix + '/auth/login', credential.login);
    app.put(apiPrefix + '/auth', jwt({secret: config.jwt.secret}), credential.changePassword);
    app.post(apiPrefix + '/auth/delete', jwt({secret: config.jwt.secret}), credential.delete);
};