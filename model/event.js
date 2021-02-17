const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
    const Mongoose = mongoose.Schema.Types

const eventSchema = new mongoose.Schema({
    event_title: {
        type: String,
        require: true
    },
    event_description: {
        type: String,
        require: true
    },
    published:{
        type: Boolean,
    },
    slug: {
        type: String,
    },
    type: {
        type: String,
    },
    start_date: {
        type: String,
        require: true
    },
    end_date: {
        type: String,
        require: true
    },
    nominees: [
        {
            id:{
                type: Mongoose.ObjectId,
                ref: 'User'
            },
            firstname : {
                type: String
            },
            lastname : {
                type: String
            },
            phone : {
                type: String
            },
            email : {
                type: String
            }
        }
    
    ],
    event_manager: {
        type : Mongoose.ObjectId,
        ref : 'User'}
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

eventSchema.plugin(mongoosePaginate);
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;