const express = require('express');
const { check,validationResult,body } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/webControllers/user');
const multer = require('multer');
const User = require('../model/user');
const passport = require('passport');
const loginauth = require('../config/auth');
const { render } = require('../app');
const LocalStrategy = require('passport-local').Strategy;
// let session;
const moment = require('moment')
const bcrypt = require('bcryptjs');
const { Session, Store } = require('express-session');
const {loginValidation,registerValidation, result} = require('../config/validate');
const storage = multer.diskStorage({
  destination : (req,file,cb) => {
    cb(null,'/profile')
  },
  filename : (req, file, cb) => {
    cb(null, file.fieldname + id + Date.now() + file.extname)
  }
})

const createToken = id => {
  return jwt.sign({
      id
  }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const upload = multer({storage : storage});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'PACES User Login'});
});
router.post('/login',loginValidation, result, async (req, res, next) => {
  
  // Check the Email
  // await User.findOne({email:req.body.email}, async (err, user)=>{
  //   if(err){
  //     throw err
  //   } 
  //   if(!user){
  //     res.render('login', {error: "This email is not registered"})
  //   } else {
  //     // Check if password matches
  //     var passwordcheck = await bcrypt.compare(req.body.password, user.password);
  //     if(!passwordcheck){
  //       res.render('login', {error: 'These credentials do not match our records'})
  //     } else {

// ----------------------------------------------
    // let user = req.session.user
    //     console.log("I am here")
    //     console.log("from route = ", req.session.user)

    //     user.newDate = moment().format("DD, MMMM YYYY")
    //     user.pageTitle = "Dashboard"

    //     if(req.session.user.role !== "1"){
    //       res.render("userDashboard", user)
    //     }else{
    //       res.render('adminDashboard', user )
    //     }
    //   }
    // }
    // console.log("new = ", req.session)
    // ------------------------------------------------
  // })  
});
  

router.get('/forgotPassword', function(req, res, next) {
  res.render('forgotPassword', {title: 'Reset Password', style: 'forgotPassword.css'});
});

router.post('/forgotPassword', body().isEmail(), async (req, res, next) => {
  await controller.forgot_password(body);
  res.render('login', {success: 'Email has been sent!'});
});


router.post('/registerMember', registerValidation, async (req, res, next) => {
  
  await User.find({email:req.body.email}, async (err,user) => {
    if(user){
      res.render('register', {error: "This email already exist."})
    }else{
      if(req.body.password !== req.body.password2){
        res.render('register', {error: 'Passwords do not match.'})
      }else if(req.body.password < 6){
        res.render('register', {error: 'Passwords should be more than 6 characters long.'})
      }else{
        let body = req.body;
        req.body.role = 2
        req.body.permission = 'user'
        req.body.firstname = body["fullname"].split(" ")[0];
        req.body.lastname = body["fullname"].split(" ")[1];
        req.body = body
        const registerMember = await controller.signup(req.body);
        res.render('register',{success:"Registration Successful, A mail has been sent to the provided email address."});
      }
    }
  })  
});


router.post('/confirm_account', async (req, res, next) => {
  	console.log("query", req.body.confirmation_token)
  	const confirm = await controller.confirm_account(req.body.confirmation_token);
	const userRole = confirm.role;
    console.log("1")
  	let link = ''
  	if(userRole === 1){
    	link = 'adminDashboard'
    	console.log("2")
  	} else {
    	link = 'userDashboard'
  	};
  	res.render(link, confirm)
});


router.post('/resetpassword', async(req,res) => {
    await controller.reset_password()
  // res.render('resetpassword', {: ""})
})


// Profile pics and profile data to be handled by different route.
router.post('/profile', async (req, res) => {
  	let profile = {
    	state: body.state,
    	local_govt: body.local_govt,
    	ward: body.ward,
    	country: body.country,
    	jobstat: body.employment_status
  	}
  	let body
  	body.firstname = req.body.firstname
  	body.lastname = req.body.lastname
  	body.phone = req.body.phone
  	body.gender = req.body.gender
	body.email = req.body.email
	body.address = req.body.address
  
  // Hash password
  	bcrypt.genSalt(10, (err, salt) => {
    	bcrypt.hash(req.password, salt, (err, hash) => {
      		body.password = hash
    	})
  	})

  	body.profile = profile

  	await User.findOneAndUpdate({email:body.email},{$set:body}, (err,user)=>{
    	if(err) return "update not succesful."
    	if(user){
      		res.render('profile', user)
    	}
  	})

  
  // Profile data
    // read database using id as search parameter
    // update profile pic data with the new value on the file input field
    // USing the new file, update the img_div with new image
})

router.get('/profile', (req, res, next) => {
  	if(!req.session.user){
    	res.render('login')
  	} else {
    // console.log('12', req.session)
    	user = req.session.user
		user.fullname = user.firstname + " " + user.lastname
		res.render('profile', user)
	}
  
  // After login,
  
  // Locate user data on the database
  // Retrieve and load
    // user image
    // user full name on the top
    // &
    // Load other details to the form ( Set input value to details read from database=)
})


router.post('/profile_pic', (req, res, next) => {

  // profile picture
    // After post data to database, change the values of the input with the new values
      // before saving, save the details to a variable for above to be easy.
    // after update, a timed alert should be displayed indicating the data is saved successfully
})


router.get('/confirm_account', async(req, res, next) => {
  	const permit = await User.findOne({confirmation_token: req.query.random_character});
  	const permission = permit && permit.permission;

  	try {

    	if((permission.includes('user')) === true){

      	await controller.confirm_account(req.query.random_character);

      // auto login user

		let user = {
			email:permit.email,
			password:permit.password,
			role:permit.role,
		  }
		  
      	login(user)

      // res.render('/userDashboard', {title: 'PACES Home', pageTitle: 'Dashboard'});

    } else if((permission.includes('admin')) === true){

      	await controller.confirm_account(req.query.random_character);

      	res.render('/adminDashboard', {title: 'PACES User'});
    }
  
} catch (error) {
    console.log(error);
}
});


router.get('/register',function(req, res, next) {
  	res.render('register', {title: 'PACES register'});
})

router.get('/reset_password/:random_character',function(req, res, next) {
  	res.render('resetPassword', {title: 'PACES reset password', style: 'forgotPassword.css'}, req.params.random_character)
})

router.get('/home', async function(req, res) {
  	console.log("Testing persistent login", req.session)
  // Check for running session
  	if(!req.session.user){
    	res.redirect('/login')
  	}else{
    	let user = req.session.user
		user.newDate = moment().format("DD, MMMM YYYY")
		user.pageTitle = "Dashboard"
		// Check for privileges
		if(user.role === '1'){
			res.render('adminDashboard', user)
		} else {
      		res.render('userDashboard', user)
    	}   
  	}  
});

router.get('/resetpassword', (req,res,next) => {
	if(!req.session.user){
		res.render('login')
	} else {
		res.render('resetpassword', {title: 'PACES Change Password'});
	}
});
  
  
  
  
  /**
   * Routing for the payment page
   */
router.get('/payment', (req,res,next) => {
    if(!req.session.user){
      	res.render('login')
    }else{
      	res.render('payment', {title: 'PACES Fund a course payment', pageTitle: 'Fund a course'})
    }
})

router.get('/payment-form', (req,res,next) => {
    if(!req.session.user){
      	res.render('login')
    }else{
        res.render('payment-form', {title: 'PACES Donation payment', pageTitle: 'Fund a course'})
    }
})
  
  
router.get('/funding', function(req, res, next) {
 	res.render('fundACourse', {title: 'PACES Fund a course', pageTitle: 'Fund a course'});
});

// Routing for the logout page
router.get('/logout', (req, res, next) => {
	if(req.session){
		req.logout()
		req.session.destroy(()=>{
		})
		res.redirect('/users/login')
	}
})


module.exports = router;