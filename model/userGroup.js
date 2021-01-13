const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types;

const userGroupSchema = new mongoose.Schema({
    USERID: {
        type: Mongoose.ObjectId,
        ref: 'user'
    },
    GROUPID: {
        type: Mongoose.ObjectId,
        ref: 'group'
    },
    
});

userGroupSchema.plugin(mongoosePaginate);
const UserGroup = mongoose.model('UserGroup', userGroupSchema)
module.exports = UserGroup