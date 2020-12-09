const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
    },
    ward: {
        type: String,
    },
    local_govt: {
        type: String,
    },
    constituency: {
        type: String,
    },
    state: {
        type: String,
    },
    federal: {
        type: String,
    }
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

groupSchema.plugin(mongoosePaginate);
const Group = mongoose.model('Group', groupSchema);
module.exports = Group;