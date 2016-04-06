'use strict';
var Credential = require('../models/credential.model');
var Course = require('../models/course.model');
var Lecture = require('../models/lecture.model');
var Presenter = require('../models/presenter.model');
var Teacher = require('../models/teacher.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');
var config = require('../config');
var paginate = require('express-paginate');

module.exports.getPresenterList = getPresenterList;
module.exports.getPresenter = getPresenter;
module.exports.getTeachers = getTeachers;
module.exports.getCourses = getCourses;
module.exports.getLectures = getLectures;
module.exports.update = updatePresenter;

function getPresenterList(req, res) {
    Presenter
        .find()
        .exec(function(err, presenters) {
            if(err) {
                return status.sendStatus(500);
            }
            var result = [];
            presenters.forEach(function(presenter) {
                result.push({
                    _id: presenter._id,
                    name: presenter.name,
                    description: presenter.description
                });

            });
            return res
                .status(200)
                .json(result);
        });
}

function getLectures (req, res) {
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
                course: {
                    _id: lecture.course._id,
                    name: lecture.course.name
                },
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
        req.checkParams('presenterId', 'Presenter Id is requested').isMongoId();
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
                presenter: req.params.presenterId,
                status: true
            })
            .populate('course teacher')
            .exec(function(err, lectures) {
                if(err) {
                    return res.sendStatus(500);
                }
                callback(null, lectures);
            });
    }
}

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
        req.checkParams('presenterId', 'Presenter Id is requested').isMongoId();
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
        var query = Course
            .find({
                presenter: req.params.presenterId,
                status: true
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

function getTeachers(req, res) {
    async.waterfall([
        validateRequest,
        findTeachers
    ], function(err, teachers) {
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
        req.checkParams('presenterId', 'Presenter Id is requested').isMongoId();
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

    function findTeachers(callback) {
        var query = Teacher
            .find({
                presenter: req.params.presenterId,
                status: true
            });
        var page = parseInt(sanitize(req.query.page)) || 1;
        var limit = parseInt(sanitize(req.query.limit)) || config.pagination.limit;

        if(req.query.getAll) {
            Teacher
                .find({
                    presenter: req.params.presenterId,
                    status: true
                })
                .populate('credential')
                .exec(function(err, teachers) {
                    if(err) {
                        return res.sendStatus(500);
                    }
                    var result = [];

                    teachers.forEach(function(teacher) {
                        result.push({
                            _id: teacher._id,
                            name: teacher.name,
                            email: teacher.credential.email,
                            imageLink: teacher.imageLink
                        });
                    });
                    return res.status(200).json({
                        data: result
                    });
                });
        } else {
            Teacher.paginate(query, {page: page, limit: limit, populate: 'credential'},
                function(err, teachers, pageCount, itemCount) {
                    if(err) {
                        return res.sendStatus(500);
                    }

                    var result = [];
                    teachers.forEach(function(teacher) {
                        result.push({
                            _id: teacher._id,
                            name: teacher.name,
                            email: teacher.credential.email,
                            imageLink: teacher.imageLink
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

function updatePresenter(req, res) {
    async.waterfall([
        validateRequest,
        updatePresenter
    ], function(err, presenter) {
        if(err) {
            return res.sendStatus(500);
        }
        var result = {
            _id: presenter._id,
            name: presenter.name,
            description: presenter.description,
            imageLink: presenter.imageLink
        };
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkBody('_id', 'Presenter Id is required').notEmpty().isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.body = sanitize(req.body);

        Credential
            .findById(req.user._id)
            .exec(function(err, credential) {
                if(err || !credential) {
                    return res.sendStatus(500);
                }
                if(!credential[credential.userType].equals(req.body._id)) {
                    return res
                        .status(401)
                        .json({
                            message: 'Invalid user Id'
                        });
                }
                callback(null);
            });
    }

    function updatePresenter(callback) {
        Presenter
            .findByIdAndUpdate(
                req.body._id,
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        imageLink: req.body.imageLink,
                        location: req.body.location,
                        vimeoToken: req.body.vimeoToken
                    }
                },
                {
                    new: true
                })
            .exec(function(err, presenter) {
                if(err) {
                    return res.sendStatus(500);
                }
                callback(null, presenter);
            });
    }
}

function getPresenter(req, res) {
    async.waterfall([
        validateRequest,
        findPresenter
        ], function(err, presenter) {
        if(err) {
            return res.sendStatus(500);
        }
        var result = {
            _id: presenter._id,
            name: presenter.name || '',
            description: presenter.description || '',
            imageLink: presenter.imageLink || '',
            location: presenter.location || ''
        };
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkParams('presenterId', 'Presenter Id is required').notEmpty().isMongoId();
        var errors = req.validationErrors();
        if(errors) {
            return callback({
                status: 400,
                message: errors[0]['error']
            });
        }
        req.body = sanitize(req.body);

        /**
         * In case all get api also need credential check
         */
        /*Credential
            .findById(req.user._id)
            .exec(function(err, credential) {
                if(err || !credential) {
                    return res.sendStatus(500);
                }
                if(!credential.userType === constants.PRESENTER) {
                    return res.sendStatus(401);
                }
                callback(null);
            });*/
        callback(null);
    }

    function findPresenter(callback) {
        Presenter
            .findById(req.params.presenterId)
            .exec(callback);
    }
}


function placeholder(req, res) {
    return res
        .status(500)
        .json({
            message: 'under construction'
        });
}
