const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    start_date: {
        type: String,
        require: true
    },
    end_date: {
        type: String,
        require: true
    },
    nominees: []
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

eventSchema.plugin(mongoosePaginate);
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;