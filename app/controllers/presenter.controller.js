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
var UploadUtil = require('../utils/uploadUtil');

module.exports.getPresenterList = getPresenterList;
module.exports.getPresenter = getPresenter;
module.exports.getTeachers = getTeachers;
module.exports.getCourses = getCourses;
module.exports.getLectures = getLectures;
module.exports.update = updatePresenter;
module.exports.getLecturesLimit = getLecturesLimit;

module.exports.getCred = getCred;
module.exports.updateZoomCred = updateZoomCred;
module.exports.updateVimeoCred = updateVimeoCred;
module.exports.uploadImage = uploadImage;

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

function getLecturesLimit(req, res) {
    async.waterfall([
        findCredential,
        findPresenter,
        findLectures
    ], function(err, lectureLimit) {
        if(err) {
            return res
                .status(err.status)
                .json({error: err.description});
        }
        if(lectureLimit) {
            return res
                .status(200)
                .json(lectureLimit)
        }
    });

    function findCredential(callback) {
        Credential
            .findById(req.user._id)
            .exec(function(err, credential) {
                if(err || !credential) {
                    callback({status:404, description:'No credential found'});
                }
                if(!credential.presenter) {
                    callback({status:401, description:'credential is not a presenter'});
                }
                if(credential) {
                    callback(null,credential.presenter);
                }
            })
    }

    function findPresenter(presenterId, callback){
        Presenter
            .findById(presenterId)
            .exec(function(err,presenter) {
                if(err || !presenter) {
                    callback({status:404, description:'No presenter found'});
                }
                if(presenter) {
                    callback(null,presenter._id);
                }
            })
    }

    function findLectures(presenterId, callback) {
        Lecture
            .find({presenter:presenterId, status: true, time:{$gt:new Date()}})
            .exec(function(err,lectures) {
                var lectureNumber = 0;
                if(err) {
                    callback({status:500, description:err.body});
                }
                if(lectures){
                    lectureNumber = lectures.length;
                }
                var lectureLimit = {
                    currentLecture:lectureNumber,
                    totalLectureLimit:config.zoomLimit
                }
                callback(null,lectureLimit);
            })
    }



}

function getCred(req, res) {
    async.waterfall([
        validateRequest,
        getCredentials
    ], function(err, presenter) {
        if(err) return res
            .status(err.status)
            .json({
                error: status.text
            });
        var result = {
            zoom: {},
            vimeo: {}
        };
        result.zoom = presenter.zoom || {};
        result.vimeo.accessToken = presenter.vimeoToken;
        return res.status(200).json(result);
    });

    function validateRequest(callback) {
        Credential
            .findById(req.user._id)
            .exec(function(err, cred) {
                if(err) return callback({
                    status: 500,
                    text: 'User not found'
                });
                if(!cred.presenter) return callback({
                    status: 400,
                    text: 'User not a presenter'
                });
                callback(null, cred.presenter);
            });
    }

    function getCredentials(presenterId, callback) {
        Presenter
            .findById(presenterId)
            .exec(function(err, presenter) {
                if(err) return callback({
                    status: 500,
                    text: 'DB error'
                });
                callback(null, presenter);
            });
    }
}

function updateZoomCred(req, res) {
    async.waterfall([
        validateRequest,
        updateCredentials
    ], function(err, presenter) {
        if(err) return res
            .status(err.status)
            .json({
                error: status.text
            });

        return res.sendStatus(200);
    });

    function validateRequest(callback) {
        Credential
            .findById(req.user._id)
            .exec(function(err, cred) {
                if(err) return callback({
                    status: 500,
                    text: 'User not found'
                });
                if(!cred.presenter) return callback({
                    status: 400,
                    text: 'User not a presenter'
                });
                callback(null, cred.presenter);
            });
    }

    function updateCredentials(presenterId, callback) {
        Presenter
            .findByIdAndUpdate(
                presenterId,
                {
                    $set: {
                        zoom: {
                            apiKey: req.body.apiKey,
                            apiSecret: req.body.apiSecret,
                            accessToken: req.body.accessToken,
                            hostId: req.body.hostId
                        }
                    }
                },
                function(err, presenter) {
                    if(err) return callback({
                        status: 500,
                        text: 'DB error'
                    });
                    callback(null);
                }
            )
    }
}

function updateVimeoCred(req, res) {
    async.waterfall([
        validateRequest,
        updateCredentials
    ], function(err, presenter) {
        if(err) return res
            .status(err.status)
            .json({
                error: status.text
            });

        return res.sendStatus(200);
    });

    function validateRequest(callback) {
        Credential
            .findById(req.user._id)
            .exec(function(err, cred) {
                if(err) return callback({
                    status: 500,
                    text: 'User not found'
                });
                if(!cred.presenter) return callback({
                    status: 400,
                    text: 'User not a presenter'
                });
                callback(null, cred.presenter);
            });
    }

    function updateCredentials(presenterId, callback) {
        Presenter
            .findByIdAndUpdate(
                presenterId,
                {
                    $set: {
                        vimeoToken: req.body.accessToken
                    }
                },
                function(err, presenter) {
                    if(err) return callback({
                        status: 500,
                        text: 'DB error'
                    });
                    callback(null);
                }
            )
    }


}

/**
 * Upload image and update presenter.imageLink
 * @param req
 * @param res
 * @returns {imageLink: }
 */

function uploadImage(req, res){
    if (!req.file || req.file.size <= 0) return res.status(400).json({error: "No file uploaded."});

    Presenter.findById( req.params.presenter_id, function(err, presenter) {
        UploadUtil.upLoadImage(req.file, 'presenter' + presenter._id, function(err, savedFileName) {
            if(err) {
                return res.status(500).json({error: err});
            }
            presenter.imageLink = savedFileName;
            presenter.save(function(err, savedPresenter) {
                return res.status(200).json({imageLink:savedFileName});
            })
        })
    });


}


