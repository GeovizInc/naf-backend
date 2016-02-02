'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
    lectures: [{
        type: Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }],
    presenter: {
        type: Schema.Types.ObjectId,
        ref: 'Presenter'
    },
    picture: {
        type: Schema.Types.String
    },
    status: {
        type: Schema.Types.Boolean,
        default: true
    }
});

if (!courseSchema.options.toJSON) {
    courseSchema.options.toJSON = {};
}
courseSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

courseSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Course', courseSchema);