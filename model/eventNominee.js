const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types
const eventNomineeSchema = new mongoose.Schema({
    userID: {
        type: Mongoose.ObjectId,
        ref:'user'
    },
    eventID: {
        type: Mongoose.ObjectId,
        ref:'event'
    }
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

eventNomineeSchema.plugin(mongoosePaginate);
const EventNominee = mongoose.model('EventNominee', eventNomineeSchema);
module.exports = EventNominee;