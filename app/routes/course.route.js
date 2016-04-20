'use strict';
var config = require('../config');
var course = require('../controllers/course.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;
var multer = require('multer');
var upload = multer({dest: config.upload});
module.exports = function(app) {
    app.get(apiPrefix + '/course/:courseId', course.getCourse);
    app.get(apiPrefix + '/course/:courseId/lectures', course.getLectures);
    app.post(apiPrefix + '/course', jwt({secret: config.jwt.secret}), course.create);
    app.put(apiPrefix + '/course', jwt({secret: config.jwt.secret}), course.update);
    app.post(apiPrefix + '/course/delete', jwt({secret: config.jwt.secret}), course.delete)
    app.post(apiPrefix + '/course/:course_id/image', [jwt({secret: config.jwt.secret}), upload.single('file')], course.uploadImage);
};