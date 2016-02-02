'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    presenter: {
        type: Schema.Types.ObjectId,
        ref: 'Presenter'
    },
    time: {
        type: Schema.Types.Date
    },
    videoLink: {
        type: Schema.Types.String
    },
    streamLink: {
        type: Schema.Types.String
    },
    picture: {
        type: Schema.Types.String
    },
    status: {
        type: Schema.Types.Boolean,
        default: true
    }
});

if (!LectureSchema.options.toJSON) {
    LectureSchema.options.toJSON = {};
}
LectureSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

LectureSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Lecture', LectureSchema);