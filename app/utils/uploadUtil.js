
'use strict';
var fs = require('fs');
var config = require('../config');
module.exports.upLoadImage = function (file, filename, callback){

        fs.exists(file.path, function(exists) {
            if (!exists) {
                return callback({
                    status: 500,
                    error: 'Something happened with the file.'
                });
            }
            var oname = file.originalname.split('.');
            var extension = oname[oname.length - 1].toLowerCase();
            console.log("name: " + oname + " extension: " + extension);
            // Check for avatar extension
            if (config.avatarExtensions.indexOf(extension) == -1) {
                fs.unlinkSync(file.path);
                return callback({
                    status: 400,
                    error: 'Only image files are allowed.'
                });
            }
            var tname = filename +'.'+ extension;
            fs.rename(file.path, config.upload + tname, function(err) {
                if (err) {
                    fs.unlinkSync(file.path);
                    return callback({
                        status: 500,
                        error: err
                    });
                }
                callback(null, tname);
            });
        });


};

