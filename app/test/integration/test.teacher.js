'use strict';
var Credential = require('../../models/credential.model');
var Attendee = require('../../models/attendee.model');
var Presenter = require('../../models/presenter.model');
var Teacher = require('../../models/teacher.model');
var Course = require('../../models/course.model');
var Lecture = require('../../models/lecture.model');

var async = require('async');
var assert = require('assert');
var config = require('../../config');
var constants = require('../../utils/constants');
var mongoose = require('mongoose');
var superagent = require('superagent');

var api = 'http://127.0.0.1:8000/api/v1';


describe('/teacher', function() {
    var presenter = {
        email: 'presenter@test.com',
        password: '1234',
        userType: constants.PRESENTER
    };
    var teacher = {
        email: 'teacher@test.com',
        password: '1234',
        userType: constants.TEACHER
    };
    var authHeader = '';
    var presenterAuthHeader = '';

    before(function(done) {
        async.waterfall([
            connectDB,
            registerPresenter,
            registerTeacher
        ], function(err) {
            done();
        });

        function connectDB(callback) {
            mongoose.connect(config.database);
            callback(null);
        }

        function registerPresenter(callback) {
            superagent
                .post(api + '/auth/register')
                .send(presenter)
                .end(function(err, res) {
                    assert.equal(err, null);
                    presenter = res.body;
                    presenterAuthHeader = res.header['authorization'];
                    callback(null);
                });
        }

        function registerTeacher(callback) {
            teacher.presenter = presenter._id;
            superagent
                .post(api + '/auth/register')
                .send(teacher)
                .end(function(err, res) {
                    assert.equal(err, null);
                    teacher = res.body;
                    authHeader = res.header['authorization'];
                    callback(null);
                });
        }
    });

    after(function(done) {
        var models = [Credential, Attendee, Teacher, Presenter, Course, Lecture];
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
            callback(null);
        }
    });

    describe('PUT /teacher', function() {
        it('should return updated teacher profile', function(done) {
            teacher.name = 'test name';
            teacher.description = 'test description';
            teacher.imageLink = 'http://test.link/image';

            superagent
                .put(api + '/teacher/')
                .set('authorization', authHeader)
                .send({
                    _id: teacher._id,
                    name: teacher.name,
                    description: teacher.description,
                    imageLink: teacher.imageLink
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    authHeader = res.header['authorization'];
                    assert.notEqual(authHeader, undefined);
                    assert.equal(res.body._id, teacher._id);
                    assert.equal(res.body.name, teacher.name, JSON.stringify(res.body, null, '\t'));
                    assert.equal(res.body.description, teacher.description);
                    assert.equal(res.body.imageLink, teacher.imageLink);
                    done();
                });
        });
    });

    describe('GET /:teacherId/', function() {
        it('should return presenter profile', function(done) {

            superagent
                .get(api + '/teacher/' + teacher._id)
                .set('Authorization', authHeader)
                .end(function(err, res) {
                    assert.equal(err, null);
                    assert.equal(res.statusCode, 200);
                    assert.equal(res.body._id, teacher._id);
                    assert.equal(res.body.name, teacher.name);
                    assert.equal(res.body.description, teacher.description);
                    assert.equal(res.body.imageLink, teacher.imageLink);
                    done();
                });
        });
    });

    describe('DELETE /teacher', function() {
        it('should return teacher id', function(done) {
            superagent
                .delete(api + '/teacher')
                .set('Authorization', presenterAuthHeader)
                .send({
                    _id: teacher._id
                })
                .end(function(err, res) {
                    assert.equal(err, null);
                    assert.equal(res.statusCode, 200);
                    assert.equal(res.body._id, teacher._id);
                    presenterAuthHeader = res.header['authorization'];
                    done();
                });
        });

        it('should get 500 if try to get deleted teacher', function(done) {
            superagent
                .get(api + '/teacher/' + teacher._id)
                .set('Authorization', presenterAuthHeader)
                .end(function(err, res) {
                    assert.notEqual(err, null);
                    assert.equal(err.status, 500);
                    done();
                });
        });
    })
});