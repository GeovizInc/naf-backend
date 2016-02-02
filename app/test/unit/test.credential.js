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

    describe('Static functions', function() {
        describe('Check email registered', function() {
            it('should pass null if an email address is not registered', function(done) {
                Credential.checkEmailRegistered('', function(err) {
                    assert.equal(err, null);
                    done();
                });
            });
            it('should pass error if email address is registered', function(done) {
                Credential.checkEmailRegistered('guoliang133@gmail.com', function(err) {
                    assert.notEqual(err, null);
                    done();
                });
            })
        });
    });
});