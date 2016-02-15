'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var courseSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    presenter: {
        type: Schema.Types.ObjectId,
        ref: 'Presenter'
    },
    imageLink: {
        type: String
    },
    status: {
        type: Boolean,
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

if (!courseSchema.options.toJSON) {
    courseSchema.options.toJSON = {};
}
courseSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

courseSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Course', courseSchema);