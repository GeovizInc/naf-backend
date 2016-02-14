'use strict';
var assert = require('assert');
var constants = require('../../utils/constants');
var Credential = require('../../models/credential.model.js');
var mongoose = require('mongoose');
var config = require('../../config');
mongoose.connect(config.database);

describe('Credential Model', function() {

    var credential = null;

    beforeEach(function(done) {
        var cred = new Credential({
            email: 'guoliang133@gmail.com',
            password: 'password',
            userType: constants.TEACHER
        });
        cred.save(function(err, saved) {
            assert.equal(err, null);
            credential = saved;
            done();
        });
    });

    afterEach(function(done) {
        Credential.remove({}, function(err, removed) {
            assert.equal(err, null);
            credential = null;
            done();
        });
    });

    describe('Dynamic functions', function() {

    });
});