const Group = require('../../model/group');
const UserGroup = require('../../model/userGroup');
exports.deleteOne = async (id) => {
    
    const deleted = await Group.deleteOne({_id:id}).then(group => { 
        return group
    }).catch( err => console.log(err))

    return deleted;
};

exports.deleteManyUserGroups = async (id) => {
    
    const deleted = await UserGroup.deleteMany({group_id:id}).then(group => { 
        return group
    }).catch( err => console.log(err))

    return deleted;
};

exports.updateOne = async (body) => {
    const newGroup = await Group.findOneAndUpdate({name:body.old_title},{$set:body},{runValidators:true,new:true}, (err,group) => {
        if (err) {
            console.log(err)
        }
        return group;
    });
    return newGroup;
};

exports.createOne = async (body) => {
    let newGroup = new Group(body);
    let message
    const group = await newGroup.save()
        .then( group => {
            if(group) {
                message = "success!";
                return group
            }
            else message = "error!" 
        })
    return group
};

exports.getOne = async (query) => {
    const group = await Group.findOne({name:query},(err, info) => {
        if(err) console.log("Couldn't get data!")
    })
    return group;
};
exports.getById = async (id) => {
    const group = await Group.findOne({_id:id},( err, res) => {
        if (err) console.log(err)
        if(res){
            
            return res
        }
    });
    
    return group;
}

exports.getAll = async () => {

    let groups
    await Group.find({},{},{sort:{timestamp: -1}})
				    .then( group => {
                        groups = group
                    })

    return groups
};

exports.getRandom = async () => {
    const getRandom = await Group.aggregate([
        {$sample:{size:3}},
        {$lookup:{ from: 'users', localField: 'leader', foreignField: '_id', as: 'leader' }},
        {$lookup:{ from: 'users', localField: 'secretary', foreignField: '_id', as: 'secretary' }}
    ],(err, res) => {
        if (err) {
            console.log(err)
        }
        return res
    })
    
    if (getRandom.length <= 0){

    } else {

        getRandom[0].leader = Object.assign({},getRandom[0].leader)
        getRandom[0].secretary = Object.assign({},getRandom[0].secretary)
        return getRandom;
    }
}

exports.getAllPaginate = async (req) => {
    var limit = parseInt(req.query.limit) || 10;
    var page = parseInt(req.query.page) || 1;
    const displayGroups = Group.paginate({}, {page:page, limit:limit,pagination:true,sort:{name:1}, populate: 'leader secretary', })
    return displayGroups;
}

exports.getOneById = async (id) => {
    const receivedGroup = await Group.findOne({_id:id}, (err, res) => {
        if(err) {
            console.log(err);
        }
        if (res) {
            return res;
        }
    }).populate('leader secretary members');

    return receivedGroup;
}

exports.updateMember = async (name,obj) => {
    console.log("in the controller")
    const updatedMember = await Group.updateOne({name:name}, {$push: {members:obj}});
    console.log("++++++++++++++++", updatedMember)
    return updatedMember;
}

exports.getUnapproved = async (req) => {
    const option = {
        limit : req.query.limit || 10,
        page : req.query.page || 1,
        paginate : true,
        sort : {firstname : 1},
        populate : 'user_id group_id'
    }
    const usersRequest = await UserGroup.paginate({approved:false}, option)
    
    return usersRequest;
}

exports.getUnapprovedCount = async (req) => {
    const unapprovedCount = await UserGroup.find({approved:false}).countDocuments((err,count) => {
        if(err) {
            console.log(err);
        }
        if(count) {
            return count;
        }
    })
    
    return unapprovedCount;
}
