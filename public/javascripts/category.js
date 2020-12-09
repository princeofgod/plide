const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    published:{
        type: Boolean,
        default: false
    },
    need_funds: {
        type:  Boolean,
        require:true
    },
    sponsors: {
        type: String
    }
})

categorySchema.plugin(mongoosePaginate)
const Category = mongoose.model('Category', categorySchema)
module.exports = Category