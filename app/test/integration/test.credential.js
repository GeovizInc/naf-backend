'use strict';
var assert = require('assert');
var superagent = require('superagent');
var api = 'http://localhost:8000/api/v1';

describe('/auth', function() {

    describe('/check', function() {
        var user = {
            email: '1@2.com',
            password: '1234'
        };

        before(function(done) {
            //save user
        });

        after(function(done) {
            // delete user
        });

        it('should return true if an email address is registered', function(done) {
            superagent
                .get(api + '/auth/check/' + user.email)
                .end(function(err, res) {
                    var actualResult = JSON.parse(res.text);
                    var expectedResult = {
                        status:  true
                    };

                    assert.equal(res.statusCode, 200);
                    assert.deepEqual(actualResult, expectedResult);

                    done();
                });
        });

        it('should return false if an email is not registered', function(done) {

        })
    });

    describe('/register', function() {
        it('should return 200 with user body and token in header', function(done) {
            var user = {
                email: '2@3.com',
                password: '1234',
                userType: 'presenter'
            };
            superagent
                .post(api + '/auth/register')
                .send(user)
                .end(function(err, res) {
                    var actualResult = JSON.parse(res.text);

                    assert.equal(res.statusCode, 200);

                    assert.notEqual(res.header['Authorization'], null);
                    assert.notEqual(res.header['Authorization'], '');

                    assert.equal(actualResult.email, user.email);
                    assert.equal(actualResult.userType, user.userType);
                    done();
                });
        });
    });

    describe('/login', function() {
        it('should return 200 with user body and token in header', function(done) {
            var data = {
                email: user.email,
                password: user.password
            };
            superagent
                .post(api + '/auth/login')
                .send(data)
                .end(function(err, res) {
                    var actualResult = JSON.parse(res.text);

                    assert.equal(res.statusCode, 200);

                    assert.notEqual(res.header['Authorization'], null);
                    assert.notEqual(res.header['Authorization'], '');

                    assert.equal(actualResult.email, user.email);
                    assert.equal(actualResult.userType, user.userType);
                    done();
                });
        });
    });

    describe('/auth', function() {
        it('should should return 200 without a message', function(done) {
            superagent
                .put(api + '/auth')
                .end(function(err, res) {
                    assert.equal(res.statusCode, 200);
                    var actualResult = JSON.parse(res.text);
                    var expectedResult = null;
                    assert.deepEqual(actualResult, expectedResult);
                    done();
                });
        });
    });
});