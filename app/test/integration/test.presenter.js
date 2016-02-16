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


describe('/presenter', function() {
    var credential = {
        email: 'presenter@test.com',
        password: '1234',
        userType: constants.PRESENTER
    };
    var authHeader = '';
    var presenter = {};

    before(function(done) {
        async.waterfall([
            connectDB,
            registerPresenter
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
                .send(credential)
                .end(function(err, res) {
                    assert.equal(err, null);
                    presenter = res.body;
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
            callback();
        }
    });

    describe('PUT /presenter', function() {
        it('should return updated presenter profile', function(done) {
            presenter.name = 'test name';
            presenter.description = 'test description';
            presenter.imageLink = 'http://test.link/image';

            superagent
                .put(api + '/presenter/')
                .set('authorization', authHeader)
                .send({
                    _id: presenter._id,
                    name: presenter.name,
                    description: presenter.description,
                    imageLink: presenter.imageLink
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    authHeader = res.header['authorization'];
                    assert.notEqual(authHeader, undefined);
                    assert.equal(res.body._id, presenter._id);
                    assert.equal(res.body.name, presenter.name, JSON.stringify(res.body, null, '\t'));
                    assert.equal(res.body.description, presenter.description);
                    assert.equal(res.body.imageLink, presenter.imageLink);
                    done();
                });
        });
    });

    describe('GET /:presenterId/', function() {
        it('should return presenter profile', function(done) {

            superagent
                .get(api + '/presenter/' + presenter._id)
                .set('Link', '')
                .set('Authorization', authHeader)
                .end(function(err, res) {
                    assert.equal(err, null);
                    assert.equal(res.statusCode, 200);
                    assert.equal(res.body._id, presenter._id);
                    assert.equal(res.body.name, presenter.name);
                    assert.equal(res.body.description, presenter.description);
                    assert.equal(res.body.imageLink, presenter.imageLink);
                    done();
                });
        });
    });

    describe('GET /:presenterId/teachers', function() {
        var teacher = {
            email: 'teacher@test.com',
            password: '1234',
            userType: constants.TEACHER
        };

        var pst = {
            email: 'another@presenter.com',
            password: '1234',
            userType: constants.PRESENTER
        };
        before(function(done) {
            async.waterfall([
                registerPresenter,
                registerTeachers,
            ], function(err) {
                done();
            });

            function registerPresenter(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send(pst)
                    .end(function(err, res) {
                        assert.equal(err, null);
                        pst = res.body;
                        callback(null);
                    });
            }

            function registerTeachers(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send({
                        email: teacher.email,
                        password: teacher.password,
                        userType: constants.TEACHER,
                        presenter: pst._id
                    })
                    .end(function(err, res) {
                        assert.equal(err, null);
                        teacher = res.body;
                        callback(null);
                    });
            }
        });

        it('should return an array of teachers', function(done) {
            superagent
                .get(api + '/presenter/' + pst._id + '/teachers')
                .set('Authorization', authHeader)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
    });

    describe('GET /:presenterId/courses', function() {

        var pst = {
            email: 'another2@presenter.com',
            password: '1234',
            userType: constants.PRESENTER
        };

        var pstAuth = null;
        before(function(done) {
            async.waterfall([
                registerPresenter,
                createCourses
            ], function(err) {
                done();
            });

            function registerPresenter(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send(pst)
                    .end(function(err, res) {
                        assert.equal(err, null);
                        pst = res.body;
                        pstAuth = res.headers['authorization'];
                        callback(null);
                    });
            }

            function createCourses(callback) {
                superagent
                    .post(api + '/course')
                    .set('Authorization', pstAuth)
                    .send({
                        name: 'course name',
                        description: 'course description',
                        imageLink: 'some link'
                    })
                    .end(function(err, res) {
                        assert.equal(err, null, JSON.stringify(err, null, '\t'));
                        callback(null);
                    });
            }
        });

        it('should return an array of teachers', function(done) {
            superagent
                .get(api + '/presenter/' + pst._id + '/courses')
                .set('Authorization', authHeader)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
    });

    describe('GET /:presenterId/lectures', function() {
        var teacher = {
            email: 'teacher2@test.com',
            password: '1234',
            userType: constants.TEACHER
        };

        var pst = {
            email: 'another3@presenter.com',
            password: '1234',
            userType: constants.PRESENTER
        };

        var course = {
            name: 'course name',
            description: 'course description',
            imageLink: 'some link'
        };

        var pstAuth = null;
        before(function(done) {
            async.waterfall([
                registerPresenter,
                registerTeacher,
                createCourses,
                createLecture
            ], function(err) {
                done();
            });

            function registerPresenter(callback) {
                superagent
                    .post(api + '/auth/register')
                    .send(pst)
                    .end(function(err, res) {
                        assert.equal(err, null);
                        pst = res.body;
                        pstAuth = res.headers['authorization'];
                        callback(null);
                    });
            }

            function registerTeacher(callback) {
                teacher.presenter = pst._id;
                superagent
                    .post(api + '/auth/register')
                    .send(teacher)
                    .end(function(err, res) {
                        assert.equal(err, null);
                        teacher = res.body;
                        callback(null);
                    });
            }

            function createCourses(callback) {
                superagent
                    .post(api + '/course')
                    .set('Authorization', pstAuth)
                    .send(course)
                    .end(function(err, res) {
                        assert.equal(err, null, JSON.stringify(err, null, '\t'));
                        course = res.body;
                        callback(null);
                    });
            }

            function createLecture(callback) {
                superagent
                    .post(api + '/lecture')
                    .set('Authorization', pstAuth)
                    .send({
                        name: 'lecture name',
                        time: new Date(),
                        description: 'lecture description',
                        teacher: teacher._id,
                        course: course._id
                    })
                    .end(function(err, res) {
                        assert.equal(err, null, JSON.stringify(err, null, '\t'));
                        callback(null);
                    });
            }
        });

        it('should return an array of teachers', function(done) {
            superagent
                .get(api + '/presenter/' + pst._id + '/lectures')
                .set('Authorization', authHeader)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
    });
});