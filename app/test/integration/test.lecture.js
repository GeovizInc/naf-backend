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


describe('/lecture', function() {
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

    var lecture = {
        name: 'test lecture',
        description: 'test lecture description',
        time: new Date()
    };

    var teacherAuthHeader = null;
    var presenterAuthHeader = null;

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
                .send({
                    email: presenter.email,
                    password: presenter.password,
                    userType: presenter.userType
                })
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
                .send({
                    email: teacher.email,
                    password: teacher.password,
                    userType: teacher.userType,
                    presenter: presenter._id
                })
                .end(function(err, res) {
                    assert.equal(err, null);
                    teacher = res.body;
                    teacherAuthHeader = res.header['authorization'];
                    callback(null);
                });
        }

        function createCourse(callback) {
            superagent
                .post(api + '/course')
                .set('Authorization', presenterAuthHeader)
                .send({
                    name: course.name,
                    description: course.description,
                    imageLink: course.imageLink
                })
                .end(function(err, res) {
                    assert.equal(err, null);
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

    describe('POST /lecture', function() {
        it('should return created lecture', function(done) {
            var teacherId = teacher._id;
            var teacherName = teacher.name;
            superagent
                .post(api + '/lecture')
                .set('Authorization', presenterAuthHeader)
                .send({
                    name: lecture.name,
                    time: lecture.time,
                    description: lecture.description,
                    teacher: teacherId,
                    course: course._id
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, lecture.name);
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.teacher._id, teacherId);
                    assert.equal(res.body.teacher.name, teacherName);
                    assert.equal(res.body.description, lecture.description);
                    assert.equal(new Date(res.body.time).getTime(), new Date(lecture.time).getTime());
                    lecture = res.body;
                    done();
                });
        });
    });

    describe('GET /lecture/:lectureId', function() {
        it('should return lecture info', function(done) {
            var teacherId = teacher._id;
            var teacherName = teacher.name;
            superagent
                .get(api + '/lecture/' + lecture._id)
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, lecture.name);
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.teacher._id, teacherId);
                    assert.equal(res.body.teacher.name, teacherName);
                    assert.equal(res.body.description, lecture.description);
                    assert.equal(new Date(res.body.time).getTime(), new Date(lecture.time).getTime());
                    lecture = res.body;
                    done();
                });
        });
    });

    describe('PUT /lecture', function() {

        var name = 'updated lecture name';
        var description = 'updated lecture description';
        var zoomLink = 'http://zoom.link';
        var vimeoLink = 'http://vimeo.link'

        var teacherId = teacher._id;
        var teacherName = teacher.name;

        var time = new Date();

        it('should return updated lecture', function(done) {
            superagent
                .put(api + '/lecture')
                .set('Authorization', presenterAuthHeader)
                .send({
                    _id: lecture._id,
                    name: name,
                    description: description,
                    time: time,
                    teacher: teacher._id,
                    zoomLink: zoomLink,
                    vimeoLink: vimeoLink
                })
                .end(function(err, res) {
                    //assert.notEqual(teacherId, null, teacher._id);
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body.name, name);
                    assert.equal(res.body.presenter._id, presenter._id);
                    assert.equal(res.body.presenter.name, presenter.name);
                    assert.equal(res.body.teacher._id, teacher._id);
                    assert.equal(res.body.teacher.name, teacherName);
                    assert.equal(res.body.description, description);
                    assert.equal(new Date(res.body.time).getTime(), time.getTime());
                    done();
                });
        });
    });

    describe('DELETE /lecture', function() {
        it('should return deleted lecture id', function(done) {
            superagent
                .delete(api + '/lecture')
                .set('Authorization', presenterAuthHeader)
                .send({
                    _id: lecture._id
                })
                .end(function(err, res) {
                    assert.equal(err, null, JSON.stringify(err, null, '\t'));
                    assert.equal(res.statusCode, 200);
                    assert.notEqual(res.body._id, null);
                    assert.equal(res.body._id, lecture._id);
                    done();
                });
        });
    });
});