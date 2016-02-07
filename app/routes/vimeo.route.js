'use strict';
var config = require('../config');
var vimeo = require('../controllers/vimeo.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/vimeo/user', vimeo.getVimeoUser);
};