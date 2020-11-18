const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    ward: {
        type: String,
        require: true
    },
    local_govt: {
        type: String,
        require: true
    },
    constituency: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    federal: {
        type: String,
        require: true
    }
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

groupSchema.plugin(mongoosePaginate);
const Group = mongoose.model('Group', groupSchema);
module.exports = Group;