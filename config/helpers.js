const async = require('async');
const User = require('../model/user');
const Event = require('../model/event')

// const totalRegistered = User.count({},())

exports.total = {
    registered: User.find({role: "2"}).count() ,
    events:Event.count({},(err,count)=>{
        if(err) {
            console.log(err)
        }
        return count;
    }),
    // registeredToday: 
}
exports.registered = User.countDocuments();
