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
    let groups 
    await newGroup.save()
        .then( group => {
            if(group) groups = group
        })
    return groups
};

exports.getOne = async (query) => {
    await Group.findOne({email:query},(err, user) => {
        if(err) console.log("Couldn't get data!")
    })
};

exports.getAll = async () => {

    let groups
    await Group.find({},{},{sort:{timestamp: -1}})
				    .then( group => {
                        console.log("Group before grouplist = ", group)
                        groups = group
                    })

    return groups
    // await Group.findOne({email:req.body["group_name"]},(err, user) => {
    //     if(err) console.log(err)
    // })
};

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