'use strict';
var config = require('../config');
var lecture = require('../controllers/lecture.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;
var multer = require('multer');
var upload = multer({dest: config.upload});

module.exports = function(app) {
    app.get(apiPrefix + '/lecture/:lectureId', lecture.getLecture);
    app.post(apiPrefix + '/lecture/', jwt({secret: config.jwt.secret}), lecture.create);
    app.put(apiPrefix + '/lecture', jwt({secret: config.jwt.secret}), lecture.update);
    app.post(apiPrefix + '/lecture/delete', jwt({secret: config.jwt.secret}), lecture.delete);
    app.post(apiPrefix + '/lecture/:lecture_id/image', [jwt({secret: config.jwt.secret}), upload.single('file')], lecture.uploadLectureImage);

};