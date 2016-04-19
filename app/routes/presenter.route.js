'use strict';
var config = require('../config');
var presenter = require('../controllers/presenter.controller');
var jwt = require('express-jwt');
var apiPrefix = config.apiPrefix;
var multer = require('multer');
var upload = multer({dest: config.upload});
module.exports = function(app) {
    app.get(apiPrefix + '/presenter', presenter.getPresenterList);
    app.get(apiPrefix + '/presenter/lectureslimit', jwt({secret: config.jwt.secret}), presenter.getLecturesLimit );
    app.get(apiPrefix + '/presenter/credentials', jwt({secret: config.jwt.secret}), presenter.getCred);
    app.get(apiPrefix + '/presenter/:presenterId', presenter.getPresenter);
    app.get(apiPrefix + '/presenter/:presenterId/teachers', presenter.getTeachers);
    app.get(apiPrefix + '/presenter/:presenterId/courses', presenter.getCourses);
    app.get(apiPrefix + '/presenter/:presenterId/lectures', presenter.getLectures);
    app.put(apiPrefix + '/presenter', jwt({secret: config.jwt.secret}), presenter.update);

    app.put(apiPrefix + '/presenter/zoom', jwt({secret: config.jwt.secret}), presenter.updateZoomCred);
    app.put(apiPrefix + '/presenter/vimeo',jwt({secret: config.jwt.secret}), presenter.updateVimeoCred);
    app.post(apiPrefix + '/presenter/:presenter_id/image', [jwt({secret: config.jwt.secret}), upload.single('file')], presenter.uploadImage);
};