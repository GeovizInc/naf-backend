'use strict';
var Credential = require('../models/credential.model');
var Course = require('../models/course.model');
var Lecture = require('../models/lecture.model');
var Teacher = require('../models/teacher.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');
var config = require('../config');
var paginate = require('express-paginate');
var UploadUtil = require('../utils/uploadUtil');

module.exports.getTeacher = getTeacher;
module.exports.getCourses = getCourses;
module.exports.getLectures = getLectures;
module.exports.update = update;
module.exports.delete = deleteTeacher;
module.exports.getVimeoCred = getVimeoCred;
module.exports.uploadTeacherImage = uploadTeacherImage;

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
            var query = Course
                .find({
                    _id: {
                        $in: courseIds
                    }
                });
            var page = parseInt(sanitize(req.query.page)) || 1;
            var limit = parseInt(sanitize(req.query.limit)) || config.pagination.limit;

            Course.paginate(query, {page: page, limit: limit},
                function(err, courses, pageCount, itemCount) {
                    if(err) {
                        return res.sendStatus(500);
                    }

                    var result = [];

                    courses.forEach(function(course) {
                        result.push({
                            _id: course._id,
                            name: course.name,
                            description: course.description,
                            imageLink: course.imageLink,
                            updatedAt: course.updatedAt
                        });
                    });

                    return res.status(200).json({
                        object: 'list',
                        hasNext: paginate.hasNextPages(req)(pageCount),
                        data: result,
                        currentPage: page,
                        limit: limit,
                        pageCount: pageCount
                    });
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
        var query = Lecture
            .find({
                teacher: req.params.teacherId,
                status: true
            })
            .sort('-date');

        var page = parseInt(sanitize(req.query.page)) || 1;
        var limit = parseInt(sanitize(req.query.limit)) || config.pagination.limit;

        Lecture.paginate(query, {page: page, limit: limit, populate: 'course'},
            function(err, lectures, pageCount, itemCount) {
                if(err) {
                    return res.sendStatus(500);
                }

                var result = [];

                lectures.forEach(function(lecture) {
                    result.push({
                        _id: lecture._id,
                        name: lecture.name,
                        description: lecture.description,
                        time: lecture.time,
                        zoomStartLink: lecture.zoomStartLink,
                        vimeoLink: lecture.vimeoLink,
                        course: {
                            _id: lecture.course._id,
                            name: lecture.course.name
                        }
                    });
                });

                return res.status(200).json({
                    object: 'list',
                    hasNext: paginate.hasNextPages(req)(pageCount),
                    data: result,
                    currentPage: page,
                    limit: limit,
                    pageCount: pageCount
                });
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
            imageLink: teacher.imageLink || '',
            presenter: {
                _id: teacher.presenter._id,
                name: teacher.presenter.name,
                location: teacher.presenter.location
            }
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
            .populate('presenter')
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
            if(!teacher._id.equals(credential.teacher) && !teacher.presenter.equals(credential.presenter)) {
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

function getVimeoCred(req, res) {
    async.waterfall([
        findCredential,
        findPresenter
    ], function(err) {
        if(err) return res.status(err.status).json({
            error: err.text
        });
    });

    function findCredential(callback) {
        Credential
            .findById(req.user._id)
            .exec(function(err, cred) {
                if(err) return callback({
                    status: 500,
                    text: 'DB error'
                });
                if(!cred.teacher) return callback({
                    status: 400,
                    text: 'User not teacher'
                });

                callback(null, cred.teacher);
            });
    }

    function findPresenter(teacherId, callback) {
        Teacher
            .findById(teacherId)
            .populate('presenter')
            .exec(function(err, teacher) {
                if(err || !teacher.presenter) return callback({
                    status: 500,
                    text: 'DB error'
                });
                var presenter = teacher.presenter;
                return res.status(200).json({
                    accessToken: presenter.vimeoToken
                });
            });
    }
}

function uploadTeacherImage(req, res){
    if (!req.file || req.file.size <= 0) return res.status(400).json({error: "No file uploaded."});
    Teacher.findById( req.params.teacher_id, function(err, teacher) {
        if(err){
            return res.status(400).json({error:"Can not find Teacher"});
        }
        UploadUtil.upLoadImage(req.file, 'teacher' + teacher._id, function(err, savedFileName) {
            if(err) {
                return res.status(500).json({error: err});
            }
            teacher.imageLink = savedFileName;
            teacher.save(function(err, savedTeacher) {
                return res.status(200).json({imageLink:savedFileName});
            })
        })
    });


}