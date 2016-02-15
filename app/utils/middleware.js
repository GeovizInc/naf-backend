'use strict';
var bodyParser = require('body-parser');
var validator = require('express-validator');
var jwt = require('jsonwebtoken');
var config = require('../config');

module.exports.setup = setup;

function setup(app) {
    addJSONParser(app);
    addValidator(app);
    addTokenHandler(app);
    addResponseHeader(app);
}


function addJSONParser(app) {
    app.use(bodyParser.json());
}

function addValidator(app) {
    var option = {
        errorFormatter: function (param, msg, value) {
            return {
                param: param,
                error: msg
            };
        }
    };
    app.use(validator(option));
}

function addTokenHandler(app) {
    app.use(function(req, res, next) {
        if(req.headers.authorization) {
            var token = req.headers.authorization.split(' ')[1];
            if(token) {
                jwt.verify(
                    token,
                    config.jwt.secret,
                    function(err, decoded) {
                        if(err || !decoded || decoded.exp * 1000 < Date.now()) {
                            return res
                                .status(401)
                                .json({
                                    message: 'Please log in'
                                });
                        }
                        var token = jwt.sign(
                            {
                                _id: decoded._id
                            },
                            config.jwt.secret,
                            {
                                expiresIn: config.jwt.expiration
                            });
                        res.set('Authorization', 'Bearer ' + token);
                        next();
                    })
            } else {
                return res
                    .status(401)
                    .json({
                        message: 'Please log in'
                    });
            }
        } else {
            next();
        }
    });
}


function addResponseHeader(app) {
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Authorization, Link');
        res.setHeader('X-Powered-By', 'NAF');
        next();
    });
}
