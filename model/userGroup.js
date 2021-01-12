const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');

const userGroupSchema = new mongoose.Schema({
    USERID: {
        type:String,
        require:true
    },
    GROUPID: {
        type: String,
        require: true
    },
    GroupLeader: {
        type: String,
        require: true
    },
    Secretary: {
        type: String,
    },
    
});

userGroupSchema.plugin(mongoosePaginate);
const UserGroup = mongoose.model('UserGroup', userGroupSchema)
module.exports = UserGroup