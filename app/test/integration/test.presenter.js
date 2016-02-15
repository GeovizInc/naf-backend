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


});