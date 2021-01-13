const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types;

const userGroupSchema = new mongoose.Schema({
    userID: {
        type: Mongoose.ObjectId,
        ref: 'user'
    },
    groupID: {
        type: Mongoose.ObjectId,
        ref: 'group'
    },
    
});

userGroupSchema.plugin(mongoosePaginate);
const UserGroup = mongoose.model('UserGroup', userGroupSchema)
module.exports = UserGroup