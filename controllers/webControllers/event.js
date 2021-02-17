const Event = require('../../model/event');
exports.deleteOne =  async (eventTitle) => {

    await Event.findOneAndDelete({event_title: eventTitle},(err, res) => {
        if(err) {
            console.log(err)
        }
        return res
    })
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
        console.log("res from controller=============", res)
    })
    console.log("event from controller=============", event)

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
    
    const publishedEvents = await Event.find({published:true},{},(err, events) =>{
        if (err){
            console.log("Events encountered an error", err)
        }
        return events
    }).populate('event_manager', "firstname lastname profile_pic")
    publishedEvents.forEach(el => {
        el.users = Object.assign({},el.users)
        el.users = el.users["0"]
    })
    return publishedEvents;
}

exports.updateNominee = async (name,obj) => {
    const updatedNominee = await Event.updateOne({event_title:name}, {$push: {nominees:obj}}, (err, nominee) => {
        if(err) console.log(err);
        if (nominee) {
            return nominee
        }
    })
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

    console.log("received events==============", receivedEvent)
    return receivedEvent;
}