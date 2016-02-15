'use strict';
var config = require('../config');
var presenter = require('../controllers/presenter.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/presenter/:presenterId', presenter.getPresenter);
    app.get(apiPrefix + '/presenter/:presenterId/teachers', presenter.getTeachers);
    app.get(apiPrefix + '/presenter/:presenterId/courses', presenter.getCourses);
    app.get(apiPrefix + '/presenter/:presenterId/lectures', presenter.getLectures);
    app.put(apiPrefix + '/presenter', jwt({secret: config.jwt.secret}), presenter.update);
};