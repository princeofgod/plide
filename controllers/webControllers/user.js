const AppError = require('../../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('../../services/mail');
const User = require('../../model/user');
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
        const user = await User.findOne({email},{runValidators:true}).select('+password');

        if (!user || !user.correctPassword(password, user.password)) {
            return 'Email/Password is incorrect'
        }

        // 2) check if user is active
        if(user.isActive === false) {
            return 'You cannot access this account. See the administrator'
        }
        
        if(role !== user.role){
            return 'Email/Password/role is incorrect'
        }
        
        // Remove the password from the output 
        user.password = undefined;
        
        return user;

    } catch (error) {
        throw error
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
                
        let emailBody = "";
        let subject = "";
        
        if(body.userType === 'admin') {
            emailBody = '<p>Hello '+user.firstname+',</p><p> An admin account has just been created for you on PLACES.</p><p> Login with the following details:</p><p>Url: '+process.env.URL+'<br />Username: '+ user.email +'<br /> Password:'+temporary_password+'<p><p>You are advised to change your password once you login.</p>Regard.<p> <p> PLACES.</p>'; // HTML body
            subject = 'PLACES Admin Account Created!';
            }
            else {
                emailBody = '<p>Hello '+user.firstname+',</p><p> Thank you for signing up on PLACES.</p><p> We are glad to have you onboard on PLACES.</p><p>Kindly click on the link below to activate your account.</p><p><a href="'+process.env.URL+'/users/confirm_account?random_character='+ confirmationToken +'">Account Activation Link</a></p><p>Or copy this link to your browser</p><p>'+process.env.URL+'/users/confirm_account?random_character='+ confirmationToken +'</p>';
                subject = 'Welcome to PLACES!';
                }
                
            await Email.sendMail(user.email, subject, emailBody);
            user.password = undefined;
        
            return user;
        
            } catch (error) {
                throw error
            }
        }


exports.confirm_account = async(random_character) => {         
    const data = await User.findOneAndUpdate({confirmation_token: random_character}, {$set: {isActive: true}}, {
        new: true,
        runValidators: true,
    });

    if (!data) {
        return 'This confirmation token doesn\'t exist'
    };
    const token = createToken(data.id); 

    return data, token;
};

exports.forgot_password = async (body) =>{
    try{
        const random_character = await generateToken();
        await User.findOneAndUpdate({email:body.email}, {$set: {remember_token: random_character}}, {
            new: true,
            runValidators: true,
            upsert: true
        }, async (err,user) => {
            const emailBody = '<p>Hello '+user.firstname+',</p><p> You recently requested to change your password.</p><p> If you did not make this request, kindly ignore this email.</p><p>To change your password, click on the link below</p><p><a href="'+process.env.URL+'/users/reset_password/'+random_character+'">Reset Password Link<a></p><p>Or copy this link to your browser</p><p>'+process.env.URL+'/users/reset_password/'+random_character+'</p>'// HTML body
        const subject =  'Password Reset Request' // Subject line
        

        // Mail User
        await Email.sendMail(user.email, subject, emailBody);

        return user;
        });

    }catch(error){
        throw error;
    }
};

exports.reset_password = async (password, random_character) =>{
    try{
        await User.findOne({remember_token: random_character})
            .then(async (user)=> {
                // console.log("Old password = ", user.password)
                // console.log("new password entered = ",password)
        const hash = await utility.hashPassword(password);
        // console.log("new hash = ",hash)

        User.findOneAndUpdate({remember_token:random_character}, {$set:{password:hash}}, {new:true},(err,user) => {
            // console.log("new pass in db = ", user)
        })})

        return errors,data
        
    }catch(error) {

    }
};

exports.deleteOne = async (id) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
        const data = await User.findByIdAndDelete({_id: id});
        if (!data) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        };

        return data

    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.updateOne = async (id, body) => {
    try {
         let user = await User.findByIdAndUpdate({_id:id}, {$set:body}, 
            {
                new:true,
                runValidators: true,
                upsert:true
            },
            async (err,user) => {
			    // THe below should repopulate the profile page with the new values
                if(err) console.log(err)
            if(user){
                return user
            }
		})
        return user;
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
        const data = await User.create(body);
        return data;
    } catch (error) {
        throw new Error("Internal ServerError")
    };
};
exports.getOneByEmail = async (query) => {
    const user = await User.findOne({email:query},(err, user) => {
        if(err) console.log("Couldn't get data!")
        return user
    })
    return user;
};

exports.getAll = async (req) => {
    var limit = parseInt(req.query.limit) || 10;
    var page = parseInt(req.query.page) || 1;
    const members = await User.paginate({}, {page:page, limit:limit,pagination:true,sort:{firstname:1}})
    
    return members;
};

exports.count = async () => {
    try {
        const data = await User.estimatedDocumentCount({});
        return data;
    } catch (error) {
        throw new Error("Internal ServerError")
    };
};

exports.search = (User, config=null) => async (body) => {
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
        const data = await User.paginate(query, options); 
        return data;
    } catch (error) {
        throw new Error("Internal ServerError")
    }
};

exports.populateProfile = (body) => {
    let profileData = {
        firstname : body.firstname,
        lastname : body.lastname,
        phone : body.phone,
        gender : body.gender,
        email : body.email,
        address : body.address,
        state: body.state,
        local_govt: body.local_govt,
        ward: body.ward,
        country: body.country,
        employment_status: body.employment_status
      }
      return profileData
}

exports.getManager = async (email) => {
    const manager = await User.findOne({email:email}, (err,user) => {
        return user._id
    })
    
    return manager
}

exports.getOneById = async id => {
    const user = await User.findOne({_id: id}).then(res => {
        return res
    })
    .catch(err => {
        console.log(err)
    })
    return user
} 

exports.getAllNoPagination = async () => {
    const users = await User.find({}).then( user => {
        return user;
    }).catch(err => {
        console.log(err)
    })
    return users;
}
