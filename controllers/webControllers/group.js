const Group = require('../../model/group');
exports.deleteOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await Group.findByIdAndDelete({_id: id});
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.updateOne = async (id, body) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {

        if(id !== body._id) {
            return next(new AppError(404, 'fail', 'The id provided doesn\'t match the user id you are trying to access'), req, res, next);
        }; 

        const data = await Group.findByIdAndUpdate(id, {$set: req.body}, {
            new: true,
            runValidators: true,
        });
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.createOne = async (body) => {
    let newGroup = new Group(body);
    let message
    await newGroup.save()
        .then( group => {
            if(group) message = "success!"
            else message = "error!" 
        })
    return message
};

exports.getOne = async (query) => {
    return group = await Group.findOne({name:query},(err, info) => {
        if(err) console.log("Couldn't get data!")
    })
};

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
    
    getRandom[0].leader = Object.assign({},getRandom[0].leader)
    getRandom[0].secretary = Object.assign({},getRandom[0].secretary)
    console.log(getRandom[0])
    return getRandom;
// })
}
// exports.Search = async (firstname, lastname) => {
//     try {
//         var page = 1;
//         var perPage = 10;
//         var query = {firstname: firstname, lastname: lastname}

//         var options = {
//             populate: populateOption.populate,      
//             lean: true,
//             page: page, 
//             limit: perPage
//         };
        
//         const data = await User.paginate(query, options); 

//         return data;

//     } catch (error) {
//         throw new Error("Internal ServerError")
//     };
// };