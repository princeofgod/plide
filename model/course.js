const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types;
const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    logo_pic: {
        type: String,
    },
    organizerId: {
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
    }
})

courseSchema.plugin(mongoosePaginate)
const Course = mongoose.model('Course', courseSchema)
module.exports = Course