const Event = require('../../model/event');
exports.deleteOne =  async (eventTitle) => {

    await Event.findOneAndDelete({event_title: eventTitle},(err, res) => {
        if(err) {
            console.log(err)
        }
        return res
    })
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // }
    // try {
    //     const data = await Event.findByIdAndDelete({_id: id});
    //     if (!data) {
    //         return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
    //     };

    //     return data

    // } catch (error) {
    //     throw new Error("Internal ServerError")
    // };
};

exports.updateOne =  async (event) => {

    
    await Event.findOneAndUpdate({name:event.old_title},{$set:event},{runValidators:true,new:true}, (err,event) => {
        if (err) {
            console.log(err)
        }
        return event
    })

    return event
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
    // const getRandom = await Event.aggregate([
    //     {$sample:{size:3}},
    //     {$lookup:{ from: 'users', localField: 'event_manager', foreignField: '_id', as: 'users' }}
    // ],(err, res) => {
    //     if (err) {
    //         console.log(err)
    //     }
    //     return res
    // })
    
    const publishedEvents = await Event.find({published:true},{},(err, events) =>{
        if (err){
            console.log("Events encountered an error", err)
        }
        return events
    }).populate('event_manager', "firstname lastname profile_pic")
    // console.log("getRandom====", getRandom[0])
    publishedEvents.forEach(el => {
        el.users = Object.assign({},el.users)
        el.users = el.users["0"]
        // console.log(el)
    })
    // console.log(getRandom[0])
    return publishedEvents;
// })
}