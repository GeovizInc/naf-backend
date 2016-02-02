'use strict';
var assert = require('assert');
var superagent = require('superagent');
var api = 'http://localhost:8000/api/v1';

describe('/auth', function() {

    describe('/check', function() {
        it('should should return 500 with a message', function(done) {
            superagent
                .get(api + '/auth/check')
                .end(function(err, res) {
                    assert.equal(res.statusCode, 500);
                    var actualResult = JSON.parse(res.text);
                    var expectedResult = {
                        message:  'under construction'
                    };
                    assert.deepEqual(actualResult, expectedResult);
                    done();
                });
        });
    });

    /*describe('/register', function() {
        it('should should return 500 with a message', function(done) {
            superagent
                .post(api + '/auth/register')
                .end(function(err, res) {
                    assert.equal(res.statusCode, 400);
                    var actualResult = JSON.parse(res.text);
                    var expectedResult = {
                        message:  'under construction'
                    };
                    assert.deepEqual(actualResult, expectedResult);
                    done();
                });
        });
    });*/

    describe('/login', function() {
        it('should should return 500 with a message', function(done) {
            superagent
                .post(api + '/auth/login')
                .end(function(err, res) {
                    assert.equal(res.statusCode, 500);
                    var actualResult = JSON.parse(res.text);
                    var expectedResult = {
                        message:  'under construction'
                    };
                    assert.deepEqual(actualResult, expectedResult);
                    done();
                });
        });
    });

    describe('/auth', function() {
        describe('PUT', function() {
            it('should should return 500 with a message', function(done) {
                superagent
                    .put(api + '/auth')
                    .end(function(err, res) {
                        assert.equal(res.statusCode, 500);
                        var actualResult = JSON.parse(res.text);
                        var expectedResult = {
                            message:  'under construction'
                        };
                        assert.deepEqual(actualResult, expectedResult);
                        done();
                    });
            });
        });

        describe('DELETE', function() {
            it('should should return 500 with a message', function(done) {
                superagent
                    .put(api + '/auth')
                    .end(function(err, res) {
                        assert.equal(res.statusCode, 500);
                        var actualResult = JSON.parse(res.text);
                        var expectedResult = {
                            message:  'under construction'
                        };
                        assert.deepEqual(actualResult, expectedResult);
                        done();
                    });
            });
        });
    });
});