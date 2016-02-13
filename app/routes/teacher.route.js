'use strict';
var config = require('../config');
var teacher = require('../controllers/teacher.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/teacher/:teacherId', teacher.getTeacher);
    app.get(apiPrefix + '/teacher/:teacherId/courses', teacher.getCourses);
    app.get(apiPrefix + '/teacher/:teacherId/courses', teacher.getLectures);
    app.put(apiPrefix + '/teacher', teacher.update);
    app.delete(apiPrefix + '/teacher', teacher.delete)
};