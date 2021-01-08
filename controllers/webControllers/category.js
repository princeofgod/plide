const Category = require('../../model/category');



exports.deleteOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await Category.findByIdAndDelete({_id: id});
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

        const data = await Category.findByIdAndUpdate(id, {$set: req.body}, {
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

    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // };
    try {
        await Category.findOne({name:body.name}, (err, category)=> {
            if(err) console.log(" Category erroe = ",err)
			if(category){
				  res.render('add-category', {error: `Category with name ${body.name} already exists!`})
			} else{
			  // Save category
				body.name = req.body.category_name;
				body.description = req.body.category_description;
		
				let newCategory = new Category(body);
				newCategory.save()
					.then(item => {
				console.log(newCategory)
				res.render("add-category", {success: `New category ${body.name} has been created`})
		  	})
			}
		  })

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };

    try {
        const data = await Category.findById(id);

        if(!data) {
          return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.getAll = async () => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    try {
        const data = await Category.find();

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };

};
