'use strict';
var Credential = require('../models/credential.model');
var Presenter = require('../models/presenter.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');

module.exports.getPresenter = getPresenter;
module.exports.getTeachers = placeholder;
module.exports.getCourses = placeholder;
module.exports.getLectures = placeholder;
module.exports.update = updatePresenter;

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
                    imageLink: req.body.imageLink
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
            imageLink: presenter.imageLink || ''
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
