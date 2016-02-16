'use strict';
var Credential = require('../models/credential.model');
var Course = require('../models/course.model');
var Lecture = require('../models/lecture.model');
var Teacher = require('../models/teacher.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');

module.exports.getTeacher = getTeacher;
module.exports.getCourses = getCourses;
module.exports.getLectures = getLectures;
module.exports.update = update;
module.exports.delete = deleteTeacher;

function getCourses(req, res) {
    async.waterfall([
        validateRequest,
        findCourses
    ], function(err, courses) {
        if(err) {
            return res
                .status(err.status)
                .json({
                    message: err.message
                });
        }

        var result = [];

        courses.forEach(function(course) {
            result.push({
                _id: course._id,
                name: course.name,
                description: course.description,
                imageLink: course.imageLink
            });
        });

        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkParams('teacherId', 'Teacher Id is requested').isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.params = sanitize(req.params);
        callback(null);
    }

    function findCourses(callback) {
        async.waterfall([
                findLectures,
                populateCourses
        ], function(err, courses) {
            if(err) {
                return res.sendStatus(500);
            }
            callback(null, courses);
        });

        function findLectures(callback) {
            Lecture
                .find({
                    teacher: req.params.teacherId,
                    status: true
                })
                .distinct('course')
                .exec(function(err, courseIds) {
                    if(err) {
                        return res.sendStatus(500);
                    }
                    callback(null, courseIds);
                });
        }

        function populateCourses(courseIds, callback) {
            Course
                .find({
                    _id: {
                        $in: courseIds
                    }
                })
                .exec(function(err, courses) {
                    if(err) {
                        return res.sendStatus(500);
                    }
                    callback(null, courses);
                });
        }
    }
}

function getLectures(req, res) {
    async.waterfall([
        validateRequest,
        findLectures
    ], function(err, lectures) {
        if(err) {
            return res
                .status(err.status)
                .json({
                    message: err.message
                });
        }

        var result = [];

        lectures.forEach(function(lecture) {
            result.push({
                _id: lecture._id,
                name: lecture.name,
                description: lecture.description,
                time: lecture.time,
                teacher: {
                    _id: lecture.teacher._id,
                    name: lecture.teacher.name
                }
            });
        });

        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkParams('teacherId', 'Teacher Id is requested').isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.params = sanitize(req.params);
        callback(null);
    }

    function findLectures(callback) {
        Lecture
            .find({
                teacher: req.params.teacherId,
                status: true
            })
            .populate('teacher')
            .sort('-date')
            .exec(function(err, lectures) {
                if(err) {
                    return res.sendStatus(500);
                }
                callback(null, lectures);
            });
    }
}

function getTeacher(req, res) {
    async.waterfall([
        validateRequest,
        findTeacher
    ], function(err, teacher) {
        if(err || !teacher) {
            return res.sendStatus(500);
        }
        var result = {
            _id: teacher._id,
            name: teacher.name || '',
            description: teacher.description || '',
            imageLink: teacher.imageLink || ''
        };
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkParams('teacherId', 'teacher Id is required').notEmpty().isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.body = sanitize(req.body);
        callback(null);
    }

    function findTeacher(callback) {
        Teacher
            .findOne({
                _id: req.params.teacherId,
                status: true
            })
            .exec(callback);
    }
}

function update(req, res) {
    async.waterfall([
        validateRequest,
        updateTeacher
    ], function(err, teacher) {
        if(err) {
            return res.sendStatus(500);
        }
        var result = {
            _id: teacher._id,
            name: teacher.name,
            description: teacher.description,
            imageLink: teacher.imageLink
        };
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkBody('_id', 'Teacher Id is required').notEmpty().isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.body = sanitize(req.body);

        async.series({
            credential: findCredential,
            teacher: findTeacher
        }, function(err, results) {
            if(err || !results.credential || !results.teacher) {
                return res.sendStatus(500);
            }
            var credential = results.credential;
            var teacher = results.teacher;
            if(!teacher._id.equals(credential.teacher) && !teacher.presenter.equals(credential._id)) {
                return callback({
                    status: 401,
                    message: 'Invalid user id'
                });
            }
            callback(null);
        });

        function findCredential(callback) {
            Credential
                .findById(req.user._id)
                .exec(function(err, credential) {
                    if(err || !credential) {
                        return res.sendStatus(500);
                    }
                    callback(null, credential);
                });
        }

        function findTeacher(callback) {
            Teacher
                .findOne({
                    _id: req.body._id,
                    status: true
                })
                .exec(function(err, teacher) {
                    if(err || !teacher) {
                        return res.sendStatus(500);
                    }
                    callback(null, teacher);
                });
        }
    }

    function updateTeacher(callback) {
        Teacher
            .findByIdAndUpdate(
                req.body._id,
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        imageLink: req.body.imageLink
                    }
                },
                {
                    new: true
                })
            .exec(function(err, teacher) {
                if(err) {
                    return res.sendStatus(500);
                }
                callback(null, teacher);
            });
    }
}

function deleteTeacher(req, res) {
    async.waterfall([
        validateRequest,
        changeTeacherStatus
    ], function(err, teacher) {
        if(err || !teacher) {
            return res.sendStatus(500);
        }
        var result = {
            _id: teacher._id
        };
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkBody('_id', 'teacher Id is required').notEmpty().isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.body = sanitize(req.body);
        async.series({
            credential: findCredential,
            teacher: findTeacher
        }, function(err, results) {
            if(err || !results.credential || !results.teacher) {
                return res.sendStatus(500);
            }
            var credential = results.credential;
            var teacher = results.teacher;
            if(!teacher.presenter.equals(credential.presenter)) {
                return callback({
                    status: 401,
                    message: 'Invalid user id'
                });
            }
            callback(null);
        });

        function findCredential(callback) {
            Credential
                .findById(req.user._id)
                .exec(function(err, credential) {
                    if(err || !credential) {
                        return res.sendStatus(500);
                    }
                    callback(null, credential);
                });
        }

        function findTeacher(callback) {
            Teacher
                .findOne({
                    _id: req.body._id,
                    status: true
                })
                .exec(function(err, teacher) {
                    if(err || !teacher) {
                        return res.sendStatus(500);
                    }
                    callback(null, teacher);
                });
        }

    }

    function changeTeacherStatus(callback) {
        Teacher
            .findByIdAndUpdate(
                req.body._id,
                {
                    $set: {
                        status: false
                    }
                })
            .exec(function(err, teacher) {
                callback(err, teacher);
            });
    }
}

function placeholder(req, res) {
    return res
        .status(500)
        .json({
            message: 'under construction'
        });
}
