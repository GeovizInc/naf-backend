'use strict';
var config = require('../config');
var course = require('../controllers/course.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/course/:courseId', course.getCourse);
    app.get(apiPrefix + '/course/:courseId/courses', course.getLectures);
    app.post(apiPrefix + '/course', course.create);
    app.put(apiPrefix + '/course', course.update);
    app.delete(apiPrefix + '/course', course.delete)
};