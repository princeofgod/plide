const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types;

const userGroupSchema = new mongoose.Schema({
    user_id: {
        type: Mongoose.ObjectId,
        ref: 'User'
    },
    group_id: {
        type: Mongoose.ObjectId,
        ref: 'Group'
    },
    position: {
        type : String,
        default:'member'
    },
    approved: {
        type : Boolean
    }
    
});

userGroupSchema.plugin(mongoosePaginate);
const UserGroup = mongoose.model('UserGroup', userGroupSchema)
module.exports = UserGroup