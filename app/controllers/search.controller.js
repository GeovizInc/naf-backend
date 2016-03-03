'use strict';
var Course = require('../models/course.model');
var sanitize = require('mongo-sanitize');
var constants = require('../utils/constants');

module.exports.findCourse = findCourse;

function findCourse(req, res) {
    req.query = sanitize(req.query);
    var presenterId = req.query.presenterId || false;
    var courseName = req.query.courseName || false;

    var params = {};
    if(presenterId) {
        params.presenter = presenterId;
    }
    if(courseName) {
        params.name = new RegExp(courseName, 'i');
        console.log(courseName);
    }

    Course
        .find(params)
        .populate('presenter')
        .exec(function(err, courses) {
            var result = [];
            courses.forEach(function(course) {
                result.push({
                    _id: course.id,
                    name: course.name,
                    /*presenter: {
                        _id: course.presenter._id,
                        name: course.presenter.name
                    },*/
                    updatedAt: course.updatedAt,
                    description: course.description
                });
            });
            return res
                .status(200)
                .json(result);
        });
}