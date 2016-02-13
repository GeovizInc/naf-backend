'use strict';
var config = require('../config');
var presenter = require('../controllers/presenter.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/presenter/:presenterId', presenter.getPresenter);
    app.get(apiPrefix + '/presenter/:presenterId/teachers', presenter.getTeachers);
    app.get(apiPrefix + '/presenter/:presenterId/courses', presenter.getCourses);
    app.get(apiPrefix + '/presenter/:presenterId/courses', presenter.getLectures);
    app.put(apiPrefix + '/presenter', presenter.update);
};