'use strict';
var config = require('../config');
var teacher = require('../controllers/teacher.controller');
var credential = require('../controllers/credential.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;
var multer = require('multer');
var upload = multer({dest: config.upload});

module.exports = function(app) {
    app.get(apiPrefix + '/teacher/getVimeoCred', jwt({secret: config.jwt.secret}), teacher.getVimeoCred);
    app.get(apiPrefix + '/teacher/:teacherId', teacher.getTeacher);
    app.get(apiPrefix + '/teacher/:teacherId/courses', teacher.getCourses);
    app.get(apiPrefix + '/teacher/:teacherId/lectures', teacher.getLectures);
    app.put(apiPrefix + '/teacher', jwt({secret: config.jwt.secret}), teacher.update);
    app.post(apiPrefix + '/teacher/delete', jwt({secret: config.jwt.secret}), teacher.delete);
    app.post(apiPrefix + '/teacher', credential.register);
    app.post(apiPrefix + '/teacher/:teacher_id/image', [jwt({secret: config.jwt.secret}), upload.single('file')], teacher.uploadTeacherImage);

};