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


describe('/course', function() {
    var presenter = {
        email: 'presenter@test.com',
        password: '1234',
        userType: constants.PRESENTER
    };

    var teacher = {
        email: 'teacher@email.com',
        password: '1234',
        userType: constants.TEACHER
    };

    var course = {
        name: 'test course',
        description: 'test course description',
        imageLink: 'http://testcourselink.com'
    };

    var id = null;

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
            superagent
                .post(api + '/auth/register')
                .send(teacher)
                .end(function(err, res) {
                    assert.equal(err, null);
                    teacher = res.body;
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

    describe('POST /course', function() {
        it('should return created course', function(done) {
            superagent
                .post(api + '/course')
                .set('Authorization', presenterAuthHeader)
                .send(course)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, course.name);
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.description, course.description);
                    assert.equal(res.body.imageLink, course.imageLink);
                    course = {
                        _id: res.body._id,
                        name: res.body.name,
                        presenter: {
                            _id: res.body.presenter._id,
                            name: res.body.presenter.name
                        },
                        description: res.body.description,
                        imageLink: res.body.imageLink
                    };
                    id = res.body._id;
                    done();
                });
        });
    });

    describe('GET /course/:courseId', function() {
        it('should return course info', function(done) {
            superagent
                .get(api + '/course/' + course._id)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, course.name, JSON.stringify(res, null, '\t'));
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.description, course.description);
                    assert.equal(res.body.imageLink, course.imageLink);
                    done();
                });
        });
    });

    describe('PUT /course', function() {

        var name = 'updated course name';
        var description = 'updated course description';
        var imageLink = 'http://somenewLink.com';


        it('should return updated course', function(done) {
            superagent
                .put(api + '/course')
                .set('Authorization', presenterAuthHeader)
                .send({
                    _id: course._id,
                    name: name,
                    description: description,
                    imageLink: imageLink
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(course, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, name);
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.description, description);
                    assert.equal(res.body.imageLink, imageLink);
                    done();
                });
        });
    });

    describe('GET /course/:courseId/lectures', function() {
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
                    .get(api + '/course/' + course._id + '/lectures')
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

    describe('DELETE /course', function() {
        it('should return deleted course id', function(done) {
            superagent
                .delete(api + '/course')
                .set('Authorization', presenterAuthHeader)
                .send({
                    _id: course._id
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body._id, course._id);
                    done();
                });
        });

    });
});