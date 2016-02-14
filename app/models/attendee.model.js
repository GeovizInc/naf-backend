'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var attendeeSchema = new Schema({
    credential: {
        type: Schema.Types.ObjectId,
        ref: 'Credential'
    },
    history: [{
        lecture: {
            type: Schema.Types.ObjectId,
            ref: 'Lecture'
        },
        time: {
            type: Schema.Types.Date
        }
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

if (!attendeeSchema.options.toJSON) {
    attendeeSchema.options.toJSON = {};
}
attendeeSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret.__v;
};

attendeeSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Attendee', attendeeSchema);