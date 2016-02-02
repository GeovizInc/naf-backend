'use strict';
var config = require('../config');
var credential = require('../controllers/credential.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/auth/check', credential.check);
    app.post(apiPrefix + '/auth/register', credential.register);
    app.post(apiPrefix + '/auth/login', credential.login);
    app.put(apiPrefix + '/auth', credential.changePassword);
    app.delete(apiPrefix + '/auth', credential.delete);
};