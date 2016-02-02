'use strict';
var bodyParser = require('body-parser');
var validator = require('express-validator');

module.exports.setup = setup;

function setup(app) {
    /*addJSONParser(app);
     addValidator(app);
     addHeader(app);*/
    app.use(bodyParser.json());
    app.use(validator({
        errorFormatter: function (param, msg, value) {
            return {
                param: param,
                error: msg
            };
        }
    }));
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Authorization, Link');
        res.setHeader('X-Powered-By', 'NAF');
        next();
    });
    return app;
}


function addJSONParser (app) {

}

function addValidator (app) {
    var option = {
        errorFormatter: function (param, msg, value) {
            return {
                param: param,
                error: msg
            };
        }
    };
    app.use(validator(option));
}

function addHeader(app) {
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Authorization, Link');
        res.setHeader('X-Powered-By', 'NAF');
        next();
    });
}

