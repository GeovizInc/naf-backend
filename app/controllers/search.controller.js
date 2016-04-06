'use strict';
var Course = require('../models/course.model');
var sanitize = require('mongo-sanitize');
var constants = require('../utils/constants');
var async = require('async');
var config = require('../config');
var paginate = require('express-paginate');

module.exports.findCourse = findCourse;

function findCourse(req, res) {
    req.query = sanitize(req.query);
    var presenterId = req.query.presenterId || false;
    var courseName = req.query.courseName || false;

    var params = {
        status: true
    };
    if(presenterId) {
        params.presenter = presenterId;
    }
    if(courseName) {
        params.name = new RegExp(courseName, 'i');
    }

    var query = Course.find(params);
    var page = parseInt(sanitize(req.query.page)) || 1;
    var limit = parseInt(sanitize(req.query.limit)) || config.pagination.limit;

    Course.paginate(query, {page: page, limit: limit, populate: 'presenter'},
        function(err, courses, pageCount, itemCount) {
            if(err) {
                return res.sendStatus(500);
            }

            var result = [];
            courses.forEach(function(course) {
                result.push({
                    _id: course.id,
                    name: course.name,
                    presenter: {
                        _id: course.presenter ? course.presenter._id : -1,
                        name: course.presenter ? course.presenter.name : 'undefined school'
                    },
                    updatedAt: course.updatedAt,
                    description: course.description,
                    imageLink: course.imageLink
                });
            });

            return res.status(200).json({
                object: 'list',
                hasNext: paginate.hasNextPages(req)(pageCount),
                data: result,
                currentPage: page,
                limit: limit,
                pageCount: pageCount
            });
        });
}