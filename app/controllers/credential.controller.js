'use strict';
var Credential = require('../models/credential.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');

module.exports.check = placeholder;
module.exports.login = placeholder;
module.exports.register = register;
module.exports.changePassword = placeholder;
module.exports.delete = placeholder;

function register(req, res) {

    async.waterfall([
        sanitizeRequestBody,
        validateRequestBody,
        saveCredential
    ], function(err, credential) {
        if(err) {
            return res.status(500).json({
                msg: err
            });
        }
        return res.sendStatus(202);
    });

    function sanitizeRequestBody(callback) {
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('userType', 'User type is required').notEmpty();
        var errors = null;
        if(errors) {
            errors = {
                status: 400,
                msg: errors
            }
        }
            req.validationErrors();
        var reqBody = sanitize(req.body);

        callback(errors, reqBody);
    }

    function validateRequestBody(reqBody, callback) {
        if (reqBody.userType != constants.TEACHER &&
        reqBody.userType != constants.ATTENDEE &&
        reqBody.userType)
        Credential.findOne({
            email: reqBody.email
        }, function(err, credential) {
            if(err || credential) {
                callback({
                    status: 400,
                    msg: ['Email is registered']
                });
            }
            callback(null, reqBody);
        });
    }

    function saveCredential(reqBody, callback) {
        var credential = new Credential({
            email: reqBody.email,
            password: reqBody.password,
            userType: constants.TEACHER
        });
        credential.save(callback);
    }
}

function placeholder(req, res) {
    return res
        .status(500)
        .json({
            message: 'under construction'
        });
}
