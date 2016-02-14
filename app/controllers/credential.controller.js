'use strict';
var Credential = require('../models/credential.model');
var Attendee = require('../models/attendee.model');
var Presenter = require('../models/presenter.model');
var Teacher = require('../models/teacher.model');
var async = require('async');
var bcrypt = require('bcryptjs');
var config = require('../config');
var constants = require('../utils/constants');
var jwt = require('jsonwebtoken');
var sanitize = require('mongo-sanitize');

module.exports.check = check;
module.exports.register = register;
module.exports.login = login;
module.exports.changePassword = changePassword;
module.exports.delete = placeholder;

function check(req, res) {
    var email = sanitize(req.params.email);
    if(!email) {
        return res
            .status(400)
            .json({
                message: 'Email is required'
            });
    }
    Credential
        .findOne({
            email: email})
        .exec(function(err, credential) {
            if(err) {
                return res.sendStatus(500);
            }
            return res
                .status(200)
                .json({
                    status: credential != null
                });
        });
}

function register(req, res) {

    async.waterfall([
        validateRequest,
        checkEmailRegistered,
        createCredential
    ], function(err, credential) {
        if(err) {
            return res
                .status(err.status)
                .json({
                    message: err.message
                });
        }
        var result = {
            _id: credential[credential.userType],
            email: credential.email,
            userType: credential.userType
        };
        res = setToken(res, credential._id);
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkBody('email', 'Email is required')
            .notEmpty()
            .isEmail();
        req.checkBody('password', 'Password is required')
            .notEmpty();
        req.checkBody('userType', 'User type is required')
            .notEmpty()
            .isIn([constants.ATTENDEE, constants.PRESENTER, constants.TEACHER]);
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

    function checkEmailRegistered(callback) {
        Credential
            .findOne({email:req.body.email})
            .exec(function(err, credential) {
                if(err) {
                    return res.sendStatus(500);
                }
                if(credential != null) {
                    return callback({
                        status: 403,
                        message: 'Email is registered'
                    });
                }
                callback(null);
            });

    }

    function createCredential(callback) {
        var credential = new Credential({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
            userType: req.body.userType
        });
        var user = req.body.userType == constants.ATTENDEE ? new Attendee({}) :
                   req.body.userType == constants.PRESENTER ? new Presenter({}) : new Teacher({});

        async.waterfall([
            saveCredential,
            saveUser,
            associateUserCredential,
            saveUser,
            saveCredential
        ], function(err) {
            if(err) {
                return res.sendStatus(500);
            }
            callback(null, credential);
        });

        function saveCredential(callback) {
            credential.save(function(err, savedCredential) {
                if(err) {
                    return res.sendStatus(500);
                }
                credential = savedCredential;
                callback(null);
            });
        }

        function saveUser(callback) {
            user.save(function(err, savedUser) {
                if(err) {
                    return res.sendStatus(500);
                }
                user = savedUser;
                callback(null);
            });
        }

        function associateUserCredential(callback) {
            credential[req.body.userType] = user._id;
            user.credential = credential._id;
            callback(null);
        }
    }
}

function login(req, res) {
    async.waterfall([
        validateRequest,
        getCredential
    ], function(err, credential) {
        if(err) {
            return res
                .status(err.status)
                .json({
                    message: err.message
                });
        }
        var result = {
            _id: credential[credential.userType],
            email: credential.email,
            userType: credential.userType,
            attendee: credential.attendee,
            presenter: credential.presenter,
            teacher: credential.teacher
        };
        res = setToken(res, credential._id);
        return res
            .status(200)
            .json(result);
    });

    function validateRequest(callback) {
        req.checkBody('email', 'Email is required').notEmpty().isEmail();
        req.checkBody('password', 'Password is required').notEmpty();

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

    function getCredential(callback) {
        Credential
            .findOne({
                email: req.body.email})
            .exec(function(err, credential) {
                if(err) {
                    return res.sendStatus(500);
                }
                if(!credential) {
                    return res
                        .status(401)
                        .json({
                            message: 'Invalid email'
                        });
                }
                if(!bcrypt.compareSync(req.body.password, credential.password)) {
                    return res
                        .status(401)
                        .json({
                            message: 'Invalid password'
                        });
                }
                callback(null, credential);
            });
    }
}

function changePassword(req, res) {
    async.waterfall([
        validateRequest,
        updateCredential
    ], function(err) {
        if(err) {
            return res
                .status(err.status)
                .json({
                    message: err.message
                });
        }

        return res.sendStatus(200);
    });

    function validateRequest(callback) {
        req.checkBody('id', 'User ID is required').notEmpty().isMongoId();
        req.checkBody('password', 'Password is required').notEmpty();

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

    function updateCredential(callback) {
        var credential = null;

        async.waterfall([
            findCredential,
            saveCredential
        ], callback);

        function findCredential(callback) {
            Credential
                .findById(req.user._id)
                .exec(function(err, foundCredential) {
                    if(err) {
                        return res.sendStatus(500);
                    }
                    if(!foundCredential || foundCredential[foundCredential.userType] != req.body.id) {
                        return callback({
                            status: 401,
                            message: 'Invalid user Id'
                        });
                    }
                    credential = foundCredential;
                    callback(null);
                });
        }

        function saveCredential(callback) {
            credential.password = bcrypt.hashSync(req.body.password);
            credential.save(function(err) {
                if(err) {
                    return res.sendStatus(500);
                }
                callback(null);
            });
        }
    }
}

function setToken(res, id) {
    var token = jwt.sign({_id: id}, config.jwt.secret, {expiresIn: config.jwt.expiration});
    res.setHeader('Authorization', 'Bearer ' + token);
    return res;
}

function placeholder(req, res) {
    return res
        .status(500)
        .json({
            message: 'under construction'
        });
}
