const UserGroup = require('../../model/userGroup');
const Group = require('../../model/group');

exports.deleteOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await UserGroup.findByIdAndDelete({_id: id});
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

        const data = await UserGroup.findByIdAndUpdate(id, {$set: req.body}, {
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    try {
        const data = await Model.create(body);

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getOne = Model => async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };

    try {
        const data = await Model.findById(id);

        if(!data) {
          return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getAll = Model => async () => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    try {
        const data = await Model.find();

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };

};

exports.getById = async id => {
    console.log("Got here")
    const usersGroup = await UserGroup.find({user_id : id})
                                .populate('group_id')
                                .then( res => {
        return res
    }).catch( err => {
        console.log(err)
    })
    
    console.log("populated userGroup", usersGroup)
    return usersGroup;
}