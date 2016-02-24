'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var presenterSchema = new Schema({
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
    location: {
        type: String
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

if (!presenterSchema.options.toJSON) {
    presenterSchema.options.toJSON = {};
}
presenterSchema.options.toJSON.transform = function(doc, ret, options) {
    delete ret._v;
};

presenterSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if (!this.createdAt ) {
        this.createdAt = now;
    }
    next();
});
presenterSchema.pre('updatePresenter', function() {
    this.updatePresenter({},{ $set: { updatedAt: new Date() } });
});

presenterSchema.plugin(deepPopulate, {} );

module.exports = mongoose.model('Presenter', presenterSchema);