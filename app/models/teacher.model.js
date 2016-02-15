'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var teacherSchema = new Schema({
    credential: {
        type: Schema.Types.ObjectId,
        ref: 'Credential'
    },
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

if (!teacherSchema.options.toJSON) {
    teacherSchema.options.toJSON = {};
}
teacherSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret._v;
};

teacherSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});
teacherSchema.pre('updatePresenter', function() {
    this.updatePresenter({},{ $set: { updatedAt: new Date() } });
});

teacherSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Teacher', teacherSchema);