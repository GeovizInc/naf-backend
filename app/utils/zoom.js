'use strict';

var config = require('../config');
var superagent = require('superagent');

/**
 * @param params {
 *     startTime,
 *     duration,
 *     timezone
 * }
 * @param callback(err, res)
 */
module.exports.createMeeting = function (params, callback) {
    superagent
        .post(config.zoom.apiPrefix + '/meeting/create')
        .query({
            api_key: params.zoom.apiKey,
            api_secret: params.zoom.apiSecret,
            data_type: 'JSON',
            host_id: params.zoom.hostId,
            topic: params.name,
            type: 2,
            start_time: params.startTime, //2016-2-23T17:00:00Z
            duration: params.duration || 45,
            timezone: 'GMT-0:00',
            option_jbh: true,
            option_host_video: true
        })
        .end(function(err, res) {
            if(err|| !res.body || res.body.error) {
                err = {
                    status: 500,
                    message: 'Unable to create zoom meeting'
                };
                return callback(err, null);
            }
            callback(err, res.body);
        });
};

module.exports.deleteMeeting = function(params, callback) {
    superagent
        .post(config.zoom.apiPrefix + '/meeting/delete')
        .query({
            api_key: params.zoom.apiKey,
            api_secret: params.zoom.apiSecret,
            data_type: 'JSON',
            host_id: params.zoom.hostId,
            id: params.id
        })
        .end(function(err, res) {
            if(err || !res.body) {
                err = {
                    status: 500,
                    message: 'Unable to create zoom meeting'
                };
                return callback(err, null);
            }

            callback(err, res.body);
        });
};

module.exports.updateMeeting = function (params, callback) {
    superagent
        .post(config.zoom.apiPrefix + '/meeting/update')
        .query({
            api_key: params.zoom.apiKey,
            api_secret: params.zoom.apiSecret,
            data_type: 'JSON',
            host_id: params.zoom.hostId,
            id: params.id,
            type: 2,
            start_time: params.startTime, //2016-2-23T17:00:00Z
            duration: params.duration || 45,
            timezone: 'GMT-0:00',
            option_jbh: true,
            option_host_video: true
        })
        .end(function(err, res) {
            if(err|| !res.body || res.body.error) {
                err = {
                    status: 500,
                    message: 'Unable to create zoom meeting'
                };
                return callback(err, null);
            }
            callback(err, res.body);
        });
};
