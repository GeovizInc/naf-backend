'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    picture: {
        type: Schema.Types.String
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