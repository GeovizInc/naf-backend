'use strict';
var config = require('../config');
var teacher = require('../controllers/teacher.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/teacher/:teacherId', teacher.getTeacher);
    app.get(apiPrefix + '/teacher/:teacherId/courses', teacher.getCourses);
    app.get(apiPrefix + '/teacher/:teacherId/lectures', teacher.getLectures);
    app.put(apiPrefix + '/teacher', jwt({secret: config.jwt.secret}), teacher.update);
    app.post(apiPrefix + '/teacher/delete', jwt({secret: config.jwt.secret}), teacher.delete)
};