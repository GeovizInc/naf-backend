'use strict';
var fs = require('fs');

module.exports.setup = setup;

function setup(app) {
    fs
        .readdirSync(__dirname)
        .forEach(function(each) {
            if (each === 'index.js') {
                return;
            }
            var name = each.substr(0, each.indexOf('.js'));
            require('./' + name)(app);
        });
}