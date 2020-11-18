const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const eventNomineeSchema = new mongoose.Schema({
    userID: {
        type: String,
        require: true
    },
    eventID: {
        type: String,
        require: true
    }
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

eventNomineeSchema.plugin(mongoosePaginate);
const EventNominee = mongoose.model('EventNominee', eventNomineeSchema);
module.exports = EventNominee;