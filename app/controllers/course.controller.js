'use strict';
var Credential = require('../models/credential.model');
var sanitize = require('mongo-sanitize');
var async = require('async');
var constants = require('../utils/constants');

module.exports.getCourse = placeholder;
module.exports.getLectures = placeholder;
module.exports.create = placeholder;
module.exports.update = placeholder;
module.exports.delete = placeholder;


function placeholder(req, res) {
    return res
        .status(500)
        .json({
            message: 'under construction'
        });
}
