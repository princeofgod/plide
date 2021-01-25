const Event = require('../../model/event');
exports.deleteOne =  async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await Event.findByIdAndDelete({_id: id});
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.updateOne =  async (event) => {

    await Event.findOneAndUpdate({name:event.name},{$set:event},{runValidators:true,new:true}, (err,event) => {
        if (err) {
            console.log(err)
            return event
        }
    })
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // }
    // try {

    //     if(id !== body._id) {
    //         return next(new AppError(404, 'fail', 'The id provided doesn\'t match the user id you are trying to access'), req, res, next);
    //     }; 

    //     const data = await Event.findByIdAndUpdate(id, {$set: req.body}, {
    //         new: true,
    //         runValidators: true,
    //     });
    //     if (!data) {
    //         return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
    //     };

    //     return data;

    // } catch (error) {
    //     throw new Error("Internal ServerError")
    // };
};

exports.createOne =  async (event) => {
    let newEvent = new Event(event);
    newEvent.save()
        .then(item => {
            console.log(item)
    })
};

exports.getOne =  async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };

    try {
        const data = await Event.findById(id);

        if(!data) {
          return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getAll =  async () => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    try {
        const data = await Event.find();

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };

};

exports.getRandom = async () => {
    const getRandom = await Event.aggregate([
        {$sample:{size:3}},
        {$lookup:{ from: 'users', localField: 'event_manager', foreignField: '_id', as: 'users' }}
    ],(err, res) => {
        if (err) {
            console.log(err)
        }
        return res
    })
    
    console.log("getRandom====", getRandom[0])
    getRandom[0].users = Object.assign({},getRandom[0].users)
  
    return getRandom;
// })
}