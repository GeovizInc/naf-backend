'use strict';
var config = require('../config');
var lecture = require('../controllers/lecture.controller');
var apiPrefix = config.apiPrefix;

module.exports = function(app) {
    app.get(apiPrefix + '/lecture/:lectureId', lecture.getLecture);
    app.post(apiPrefix + '/lecture/', lecture.create);
    app.put(apiPrefix + '/lecture', lecture.update);
    app.delete(apiPrefix + '/lecture', lecture.delete);
};