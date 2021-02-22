const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types;
const causeSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    organiserId: {
        type: Mongoose.ObjectId,
        ref: 'User'
    },
    need_funds: {
        type: Boolean,
    },
    amount_needed: {
        type: String,
    },
    sponsors: {
        type: String
    },
    logo : {
        type: String,
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    phone : {
        type: String
    },
    shares : {
        type : Number,
        default : 0
    },
    image : {
        type: String,
        default: "default.svg"
    }
})

causeSchema.plugin(mongoosePaginate)
const Cause = mongoose.model('Cause', causeSchema)
module.exports = Cause