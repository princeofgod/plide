const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const scheduleSchema = new mongoose.Schema({
    group: {
        type: String,
        require: true
    },
    date: {
        type: String,
        require: true
    },
    start_time: {
        type: String,
        require: true
    },
    end_time: {
        type: String,
        require: true
    }
})

scheduleSchema.plugin(mongoosePaginate)
const Schedule = mongoose.model('Schedule', scheduleSchema)
module.exports = Schedule