'use strict';

var Zoom = require('../../utils/zoom');
var assert = require('assert');

describe('Zoom module', function() {
    it('should return meeting url if meeting successfully created', function(done) {
        var params = {
            name: 'test meeting',
            startTime: '2016-2-23T17:00:00Z',
            timezone: 'GMT-5:00',
            duration: 45
        };
        Zoom.createMeeting(params, function(err, res) {
            assert.equal(err, null);
            assert.notEqual(res.start_url, '');
            assert.notEqual(res.join_url, '');
            done();
        });
    });
});