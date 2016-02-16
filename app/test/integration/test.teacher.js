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
    var course = {
        name: 'test course',
        description: 'test course description',
        imageLink: 'http://testcourselink.com'
    };
    var authHeader = '';
    var presenterAuthHeader = '';

    before(function(done) {
        async.waterfall([
            connectDB,
            registerPresenter,
            registerTeacher,
            createCourse
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

        function createCourse(callback) {
            superagent
                .post(api + '/course')
                .set('Authorization', presenterAuthHeader)
                .send(course)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    course = res.body;
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

    describe('GET /teacher/:teacherId/lectures', function() {
        it('shoudl return an array of lectures', function(done) {
            var lectures = [
                {
                    name: 'lecture1',
                    time: new Date(),
                    description: 'description1',
                    teacher: teacher._id,
                    course: course._id
                },
                {
                    name: 'lecture2',
                    time: new Date(),
                    description: 'description2',
                    teacher: teacher._id,
                    course: course._id
                },
                {
                    name: 'lecture3',
                    time: new Date(),
                    description: 'description3',
                    teacher: teacher._id,
                    course: course._id
                }
            ];

            createLectures(function() {
                superagent
                    .get(api + '/teacher/' + teacher._id + '/lectures')
                    .set('Authorization', presenterAuthHeader)
                    .end(function(err, res) {
                        assert.equal(err, null, JSON.stringify(err, null, '\t'));
                        assert.equal(res.body.length, 3);
                        done();
                    });
            });


            function createLectures(callback) {
                async.each(
                    lectures,
                    createLecture,
                    function(err) {
                        assert.equal(err, null);
                        callback();
                    }
                );
            }


            function createLecture(lecture, callback) {
                superagent
                    .post(api + '/lecture')
                    .set('Authorization', presenterAuthHeader)
                    .send(lecture)
                    .end(function(err, res) {
                        assert.equal(err, null, JSON.stringify(err, null, '\t'));
                        callback(null);
                    });
            }
        });
    });

    describe('GET /teacher/:teacherId/courses', function() {
        it('should return an array of course', function(done) {
            superagent
                .get(api + '/teacher/' + teacher._id + '/courses')
                .set('Authorization', presenterAuthHeader)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.body.length, 1);
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