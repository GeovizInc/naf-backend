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
            api_key: config.zoom.apiKey,
            api_secret: config.zoom.apiSecret,
            data_type: 'JSON',
            host_id: config.zoom.hostId,
            topic: params.name,
            type: 2,
            start_time: params.startTime, //2016-2-23T17:00:00Z
            duration: params.duration || 45,
            timezone: params.timezone || 'GMT-5:00',
            option_jbh: true,
            option_host_video: true
        })
        .end(function(err, res) {
            if(res.body.error) {
                err = {
                    status: res.body.error.code,
                    message: res.body.error.message
                }
            }
            callback(err, res.body);
        });
};
