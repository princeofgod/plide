const AppError = require('../../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('../../services/mail');
const User = require('../../public/javascripts/user');
const { uuid } = require('uuidv4');
const {validationResult} = require('express-validator');
const utility = require('../../services/utility');


const createToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const generateToken = async () => {  
    try{
      const token = uuid();    
      const model = await User.findOne({confirmation_token: token});
      if(model) {
        return this.generateToken();
      }
    
      return token;
    }
    catch(error) {
      return error;
    }    
};

exports.login = async (options) => {
    const errors = validationResult(options);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const {email, password, role} = options;

        // 1) check if user exist and  password is correct
        const user = await User.findOne({email}).select('+password');

        if (!user || !await user.correctPassword(password, user.password)) {
            return next(new AppError(406, 'Not acceptable', 'Email/Password is incorrect'), req, res, next);
        }

        // 2) check if user is active
        if(user.isActive === false) {
            return next(new AppError(401, 'Unauthorized', 'You cannot access this account. See the administrator'), req, res, next);
        }
        
        if(role !== user.role){
            return next(new AppError(403, 'fail', 'Email/Password is incorrect'), req, res, next);
        }
        
        // 4) All correct, send jwt to client
        const token = createToken(user.id);
        
        // Remove the password from the output 
        user.password = undefined;
        
        return user;

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.signup = async (options) => {
    const errors = validationResult(options);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    };

    try {
        const confirmationToken = await generateToken();       
        const temporary_password = utility.generateRandomCharacter(6);  
        let body = options;
        body.isActive = options && options.role === 1 ? true : false;
        body.confirmation_token = confirmationToken; 
        body.password = options.password ? options.password : temporary_password;
        const user = await User.create(body);
        console.log("1", user)
        
        let emailBody = "";
        let subject = "";

        if(body.userType === 'admin') {
            emailBody = '<p>Hello '+user.firstname+',</p><p> An admin account has just been created for you on PLACES.</p><p> Login with the following details:</p><p>Url: '+process.env.URL+'<br />Username: '+ user.email +'<br /> Password:'+temporary_password+'<p><p>You are advised to change your password once you login.</p>Regard.<p> <p> PLACES.</p>'; // HTML body
            subject = 'PLACES Admin Account Created!';
        }
        else {
            emailBody = '<p>Hello '+user.firstname+',</p><p> Thank you for signing up on PLACES.</p><p> We are glad to have you onboard on PLACES.</p><p>Kindly click on the link below to activate your account.</p><p><a href="'+process.env.URL+'/confirm_account?random_character='+ confirmationToken +'">Account Activation Link</a></p>';
            subject = 'Welcome to PLACES!';
        }
        
        await Email.sendMail(user.email, subject, emailBody);
        user.password = undefined;

        return user;

    } catch (error) {
        throw error
    }

};

exports.confirm_account = async(random_character) => {         
    const data = await User.findOneAndUpdate({confirmation_token: random_character}, {$set: {isActive: true}}, {
        new: true,
        runValidators: true,
    });

    if (!data) {
        return next(new AppError(404, 'fail', 'This confirmation token doesn\'t exist'), req, res, next);
    };

    const token = createToken(data.id); 

    return data, token;
};

exports.forgot_password = async (body) =>{
    const errors = validationResult(body);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try{
        const random_character = await generateToken();
        const user = await User.findOneAndUpdate({email:body.email, role:body.role}, {$set: {remember_token: random_character}}, {
            new: true,
            runValidators: true,
        });

        if(!user){
            return next(new AppError(403, 'fail', 'The email does not exist'), req, res, next);
        };
        
        const emailBody = '<p>Hello '+user.firstname+',</p><p> You recently requested to change your password.</p><p> If you did not make this request, kindly ignore this email.</p><p>To change your password, click on the link below</p><p><a href="'+process.env.URL+'/user/reset_password/'+random_character+'">Reset Password Link<a></p>'// HTML body
        const subject =  'Password Reset Request' // Subject line
        
        // Mail User
        await Email.sendMail(user.email, subject, emailBody);

        return user;

    }catch(error){
        throw error;
    }
};

exports.reset_password = async (req, res, next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };

    try{
        const hash = await utility.hashPassword(req.body.password);
        const data = await User.findOneAndUpdate({remember_token: req.params.random_character}, {$set: {password: hash}}, {
            new: true,
            runValidators: true,
        });

        if (!data) {
            return next(new AppError(404, 'fail', 'Invalid user id'), req, res, next);
        };

        if (req.params.random_character !== data.remember_token) {
            return next(new AppError(404, 'fail', 'Invalid token'), req, res, next);
        };

        res.status(200).json({
            status: 'your password reset was successful',
            data
        });
    }catch(error) {
        next(error);
    }
};

exports.deleteOne = Model => async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await Model.findByIdAndDelete({_id: id});
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.updateOne = Model => async (id, body) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {

        if(id !== body._id) {
            return next(new AppError(404, 'fail', 'The id provided doesn\'t match the user id you are trying to access'), req, res, next);
        }; 

        const data = await Model.findByIdAndUpdate(id, {$set: req.body}, {
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

exports.createOne = Model => async (body) => {
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

exports.count = Model => async () => {
    try {
        const data = await Model.estimatedDocumentCount({});

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.search = (Model, config=null) => async (body) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    };
    try {
        var page = (body.page) ? body.page : 1;
        var perPage = (body.limit) ? body.limit :10;
        var query = body.query || {};
        
        var options = {
            sort: body.sort || {createdAt: -1},            
            lean: true,
            page: page, 
            limit: perPage
        };

        if(config && config.populate) {
            options.populate = config.populate;
        };
        
        const data = await Model.paginate(query, options); 

        return data;

    } catch (error) {
        throw new Error("Internal ServerError")
    }
};

// Authorization check if the user have rights to do this action
// exports.restrictTo = (...permission) => {
//     return (req, res, next) => {
//         let result = req.user.permission.some(i => permission.includes(i));

//         if (!result) {
//             return next(new AppError(403, 'fail', 'You are not allowed to do this action'), req, res, next);
//         }
//         next();
//     };
// };