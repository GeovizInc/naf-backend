'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var presenterSchema = new Schema({
    credential: {
        type: Schema.Types.ObjectId,
        ref: 'Credential'
    },
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }],
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    lectures: [{
        type: Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    imageLink: {
        type: Schema.Types.String
    },
    status: {
        type: Schema.Types.Boolean,
        default: true
    },
    createdAt: {
        type: Schema.Types.Date
    },
    updatedAt: {
        type: Schema.Types.Date
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Credential'
    }
});

if (!presenterSchema.options.toJSON) {
    presenterSchema.options.toJSON = {};
}
presenterSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

presenterSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Presenter', presenterSchema);