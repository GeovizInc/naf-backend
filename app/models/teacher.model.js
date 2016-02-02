'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teacherSchema = new Schema({
    credential: {
        type: Schema.Types.ObjectId,
        ref: 'Credential'
    },
    presenter: {
        type: Schema.Types.ObjectId,
        ref: 'Presenter'
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    lectures: [{
        type: Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    picture: {
        type: Schema.Types.String
    }
});

if (!teacherSchema.options.toJSON) {
    teacherSchema.options.toJSON = {};
}
teacherSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

teacherSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Teacher', teacherSchema);