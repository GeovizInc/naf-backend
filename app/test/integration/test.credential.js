'use strict';
var Credential = require('../../models/credential.model');
var Presenter = require('../../models/presenter.model');
var Teacher = require('../../models/teacher.model');
var Attendee = require('../../models/attendee.model');

var async = require('async');
var assert = require('assert');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var constants = require('../../utils/constants');
var mongoose = require('mongoose');
var superagent = require('superagent');

var api = 'http://127.0.0.1:8000/api/v1';

describe('/auth', function() {
    var password = '1234';
    var cred = new Credential({
        email: '1@2.com',
        password: bcrypt.hashSync(password),
        userType: constants.PRESENTER
    });

    before(function(done) {
        mongoose.connect(config.database);
        cred.save(function(err, savedCredential) {
            assert.equal(false, err || !savedCredential);
            cred = savedCredential;
            done();
        });

    });

    after(function(done) {
        var models = [Credential, Attendee, Teacher, Presenter];
        async.waterfall([
            clearDB,
            closeDBConnection
        ], function(err) {
            done();
        });

        function clearDB(callback) {
            async.each(
                models,
                function(model, callback) {
                    model
                        .find({})
                        .remove()
                        .exec(function(err, removedCredential) {
                            assert.equal(false, err || !removedCredential);
                            callback(null);
                        });
                },
                function(err) {
                    callback(null);
                }
            );
        }

        function closeDBConnection(callback) {
            mongoose.connection.close();
            callback();
        }
    });

    describe('/check', function() {
        it('should return 404 if not email is provided', function(done) {
            superagent
                .get(api + '/auth/email/' )
                .end(function(err, res) {
                    assert.equal(res.statusCode, 404);
                    done();
                });
        });

        it('should return true if an email address is registered', function(done) {
            superagent
                .get(api + '/auth/email/' + cred.email)
                .end(function(err, res) {
                    var expectedResult = {
                        status:  true
                    };
                    assert.equal(res.statusCode, 200);
                    assert.deepEqual(res.body, expectedResult);
                    done();
                });
        });

        it('should return false if an email is not registered', function(done) {
            superagent
                .get(api + '/auth/email/' + 'some@email.address')
                .end(function(err, res) {
                    var expectedResult = {
                        status:  false
                    };
                    assert.equal(res.statusCode, 200);
                    assert.deepEqual(res.body, expectedResult);
                    done();
                });
        });
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
                    assert.equal(err, null);
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.header['authorization'], undefined);
                    assert.equal(res.body.email, user.email);
                    assert.equal(res.body.userType, user.userType);
                    done();
                });
        });

        it('should return 403 if email is registered', function(done) {
            var user = {
                email: cred.email,
                password: '1234',
                userType: 'presenter'
            };
            superagent
                .post(api + '/auth/register')
                .send(user)
                .end(function(err, res) {
                    assert.notEqual(err, null);
                    assert.equal(err.status, 403);
                    done();
                });
        });
    });

    describe('/login', function() {
        it('should return 200 with user body and token in header', function(done) {
            var user = {
                email: 'login@test.com',
                password: '1234',
                userType: 'attendee'
            };

            async.waterfall([
                register,
                login,
            ], function(err){
                done();
            });

            function register(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send(user)
                    .end(function(err, res) {
                        assert.equal(err, null);
                        assert.equal(res.statusCode, 200);
                        assert.notEqual(res.header['authorization'], undefined);
                        assert.equal(res.body.email, user.email);
                        assert.equal(res.body.userType, user.userType);
                        callback(null);
                    });
            }

            function login(callback) {
                superagent
                    .post(api + '/auth/login')
                    .send(user)
                    .end(function(err, res) {
                        assert.equal(res.statusCode, 200, JSON.stringify(err));
                        assert.notEqual(res.header['authorization'], undefined);
                        assert.equal(res.body.email, user.email);
                        assert.equal(res.body.userType, user.userType, JSON.stringify(res.body));
                        assert.notEqual(res.body[res.body.userType], undefined, JSON.stringify(res.body));
                        assert.notEqual(res.body[res.body.userType], null);
                        callback(null);
                    });
            }

        });
    });

    describe('/auth', function() {
        var authHeader = null;
        var changedPassword = '4321';
        var id = null;

        var user = {
            email: 'changePassword@test.com',
            password: password,
            userType: 'presenter'
        };

        before(function(done) {
            async.waterfall([
                register,
                changePassword
            ], function(err) {
                done();
            });


            function register(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send({
                        email: user.email,
                        password: '1234',
                        userType: user.userType
                    })
                    .end(function(err, res) {
                        assert.equal(err, null);
                        assert.equal(res.statusCode, 200);
                        authHeader = res.header['authorization'];
                        user.id = res.body._id;
                        callback(null);
                    });
            }

            function changePassword(callback) {
                var data = {
                    id: user.id,
                    password: changedPassword
                };
                superagent
                    .put(api + '/auth')
                    .set('Authorization', authHeader)
                    .send(data)
                    .end(function(err, res) {
                        assert.equal(res.statusCode, 200, JSON.stringify(data));
                        authHeader = res.header['authorization'];
                        callback(null);
                    });
            }
        });

        it('should should return 200 without a message', function(done) {

            superagent
                .post(api + '/auth/login')
                .send({
                    email: user.email,
                    password: changedPassword
                })
                .end(function(err, res) {
                    authHeader = res.header['authorization'];
                    assert.equal(err, null);
                    done();
                });
        });
    });
});