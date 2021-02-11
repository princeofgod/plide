const Course = require('../../model/course');



exports.deleteOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await Course.findByIdAndDelete({_id: id});
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getById = async (id) => {
    const course = await Course.findOne({_id:id},( err, res) => {
        if (err) console.log(err)
        if(res){
            console.log("returned res====", res)
            return res
        }
    });
    console.log("group in webcontrollers === ", course)
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

        const data = await Course.findByIdAndUpdate(id, {$set: req.body}, {
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

    console.log("body in controller ===== ", body)
    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // };
    try {
        // Save category
        body.name = body.category_name;
        body.description = body.category_description;

        let newCourse = new Course(body);
        newCourse.save()
            .then(item => {
        console.log(newCourse)
        return item
    })
    } catch (error) {
        // throw new Error("Internal ServerError")
    };
};

exports.getOne = async (id) => {
    const course = await Course.findOne({_id:id},(err, course) => {
        if(err) console.log(err)
        if(course) {
            return course;
        }
    }).populate("organizer","firstname ")
    console.log("course controller", course)
    return course;
};

exports.getAll = async () => {
    const categories = await Course.find({},{},(err,category) => {
        if (err) console.log(err)
        if (category){
            return category
        } 
    })

    return categories
};
exports.getFundableCourses = async () => {
    const courses = await Course.find({need_funds: true}, (err, res) => {
        if(err) console.log(err)
        else{
            return res
        }
    })
    return courses
}
