const Event = require('../../model/event');
exports.deleteOne =  async (eventTitle) => {

    const deleted = await Event.deleteOne({event_title:eventTitle}).then(event => { 
        return event
    }).catch( err => console.log(err))
    // await Event.findOneAndDelete({event_title: eventTitle},(err, res) => {
    //     if(err) {
    //         console.log(err)
    //     }
    //     return res
    // })
    return deleted;
};

exports.updateOne =  async (event) => {

    const newEvent = await Event.findOneAndUpdate({event_title:event.old_title},{$set:event},{runValidators:true,new:true}, (err,event) => {
        if (err) {
            console.log(err)
        }
        return event
    })
    return newEvent
    
};

exports.createOne =  async (event) => {
    let newEvent = new Event(event);
    newEvent.save()
        .then(item => {
            
    })
};


exports.getOne = async (name) => {
    const event = await Event.findOne({event_title: name}, (err, res) => {
        if (err) console.log(err);

    })

    return event;
}

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
    let publishedEvents = await Event.find({published:true}).limit(4).populate('event_manager', "firstname lastname profile_pic").then(events => {
        return events;
    }).catch(err=> console.log(err))
    return publishedEvents;
}

exports.updateNominee = async (name,obj) => {
    const updatedNominee = await Event.updateOne({event_title:name}, {$push: {nominees:obj}})
    return updatedNominee;
}

exports.getAllPaginated = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const events = await Event.paginate({}, {page:page, limit:limit, sort:{event_title:1},paginate:true,populate: 'event_manager'});

    return events;
}

exports.getOneById = async (id) => {
    const receivedEvent = await Event.findOne({_id:id}, (err, res) => {
        if(err) {
            console.log(err);
        }
        if (res) {
            return res;
        }
    }).populate('event_manager nominees');

    return receivedEvent;
}