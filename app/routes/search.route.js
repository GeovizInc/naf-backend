'use strict';
var config = require('../config');
var search = require('../controllers/search.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/search', search.find);
};