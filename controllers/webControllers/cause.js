const Cause = require('../../model/cause');



exports.deleteOne = async (id) => {
   const del = await Cause.deleteOne({_id: id}).then(res => {
       return res;
   }).catch(err => {
       console.log(err)
   })
};

exports.getById = async (id) => {
    const course = await Cause.findOne({_id:id},( err, res) => {
        if (err) console.log(err)
        if(res){
            // console.log("returned res====", res)
            return res
        }
    });
    // console.log("group in webcontrollers === ", course)
    return course;
}


exports.updateOne = async (id, body) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {

        if(id !== body._id) {
            return next(new AppError(404, 'fail', 'The id provided doesn\'t match the user id you are trying to access'), req, res, next);
        }; 

        const data = await Cause.findByIdAndUpdate(id, {$set: req.body}, {
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

    // console.log("body in controller ===== ", body)
    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // };
    try {
        // Save cause
        body.name = body.category_name;
        body.description = body.category_description;

        let newCause = new Cause(body);
        newCause.save()
            .then(item => {
        console.log(newCause)
        return item
    })
    } catch (error) {
        // throw new Error("Internal ServerError")
    };
};

exports.getOne = async (id) => {
    const cause = await Cause.findOne({_id:id},(err, result) => {
        if(err) console.log(err)
        if(result) {
            return result;
        }
    }).populate("organizerId","firstname lastname")
    console.log("cause controller", cause)
    return cause;
};

exports.getAll = async () => {
    const causes = await Cause.find({},{},(err,cause) => {
        if (err) console.log(err)
        if (cause){
            return cause
        } 
    });

    return causes;
};
exports.getFundableCourses = async () => {
    const causes = await Cause.find({need_funds: true}, (err, res) => {
        if(err) console.log(err)
        else{
            return res
        }
    })
    return causes
}

exports.getAllPaginated = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const cause = Cause.paginate({},{page:page, limit:limit, paginate:true, sort:{name:1}});
    return cause;
}