const express = require('express');
const { validationResult,check,param } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/webControllers/user');
const multer = require('multer');
const User = require('../model/user');
// const passport = require('passport');
// const loginauth = require('../config/auth');
const { render } = require('../app');
// const LocalStrategy = require('passport-local').Strategy;
// let session;
var validate = require("../config/validate")
const moment = require('moment')
const bcrypt = require('bcryptjs');
const { Session, Store } = require('express-session');
const {resetPasswordValidation, loginValidation,registerValidation, result, forgotPasswordValidation, tokenVerify} = require('../config/validate');
const storage = multer.diskStorage({
	destination : (req,file,cb) => {
		cb(null,'/profile')
	},
	filename : (req, file, cb) => {
		cb(null, file.fieldname + id + Date.now() + file.extname)
	}
})
// const {store} = require('../app')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const store = new MongoStore({
	uri: 'mongodb://localhost:27017/MVC1',
	// databaseName:'MVC1',
	collection: 'sessions'
  });

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


router.post('/login',loginValidation, async (req, res, next) => {
	const result = validationResult(req)
	
	if(!result.isEmpty()){
		error = result.array()[0].msg
		res.render("login", {error: error})
	}else{
		await User.findOne({email:req.body.email})
			.then(user => {
				req.session.user = user
				user.newDate = moment().format("DD, MMMM YYYY")
				user.pageTitle = "Dashboard"
				// user.title = "PACES User Dashboard"
				
				console.log("sesson ID from the login route = ", req.sessionID)
				console.log("sesson = ", req.session)
				console.log("sessiom id tyupe = ", req.session.id)

				if(req.session.user.role !== "1"){
					res.redirect("home",)
				}else{
					res.render('adminDashboard', user )
				}
			})
			.catch(error => {

			})
	}
});
// 	// -----------------------------------------------------------------
	
/**
 * Routing for forgot password
 */
router.get('/forgotPassword', function(req, res, next) {
  	res.render('forgotPassword', {title: 'Reset Password', style: 'forgotPassword.css'});
});

router.post('/forgotPassword',forgotPasswordValidation, async (req, res, next) => {
	const result = validationResult(req)

	if(!result.isEmpty()){
		error = result.array()[0].msg
		res.render("forgotPassword", {error: error})
	} else {
		await userController.forgot_password(req.body);
		res.render('forgotPassword', {success: 'Password reset mail has been successfully sent!'});
	}
});

/**
 * Routing for registration
 */
router.get('/register',function(req, res, next) {
	res.render('register', {title: 'PACES register'});
})

router.post('/registerMember', registerValidation, async (req, res, next) => {
		// -----------------------------------------------
		const result = validationResult(req)
		if(!result.isEmpty()){
			error = result.array()[0].msg
			res.render("register", {error: error})
		}else{
			let body = req.body;
			req.body.role = 2
			req.body.permission = 'user'
			req.body.firstname = body["fullname"].split(" ")[0];
			req.body.lastname = body["fullname"].split(" ")[1];
			req.body = body
			const registerMember = await userController.signup(req.body);
			res.render('register',{success:"Registration Successful, A mail has been sent to the provided email address."});
		}
});

/**
 * Routing for account confirmation
 */
router.get('/confirm_account', async(req, res, next) => {
	const permit = await User.findOne({confirmation_token: req.query.random_character});
	const permission = permit && permit.permission;
	let title
	let user = {
		name:permit.firstname,
		email:permit.email,
		password:permit.password,
		role:permit.role,
		pageTitle: "Dashboard",
		newDate : moment().format("DD, MMMM YYYY"),
		title : title,
	  }
	try {

	  	if((permission.includes('user')) === true){
			title = "PACES User Dashboard"
			await userController.confirm_account(req.query.random_character);
			res.render('userDashboard', user);
  		} else if((permission.includes('admin')) === true){
			title = "PACES User Dashboard"
			await userController.confirm_account(req.query.random_character);
			res.render('adminDashboard', user);
  }
} catch (error) {
  console.log(error);
}
});


router.post('/confirm_account', async (req, res, next) => {
  	console.log("query", req.body.confirmation_token)
  	const confirm = await controller.confirm_account(req.body.confirmation_token);
	const userRole = confirm.role;
  	let link = ''
  	if(userRole === 1){
    	link = 'adminDashboard'
  	} else {
    	link = 'userDashboard'
  	};
  	res.render(link, confirm)
});

/**
 * Routing for password reset
 */

router.get('/reset_password/:random_character', tokenVerify, async (req, res) => {
	const result = validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.render("login", {error : error})
	} else {
		// search the db with the token and return a user
		await User.findOne({remember_token:req.params.random_character}, (err, user) => {
			if(err) console.log(err)
			req.session.user = user
		})
		res.redirect("../changePassword")
	}
})

router.get('/resetpassword', (req,res,next) => {
	if(!res.session.user){
		res.render('login')
	} else {
		res.render('resetpassword', {title: 'PACES Change Password'});
	}
});

router.post('/resetpassword', resetPasswordValidation, async(req,res) => {
	console.log("req.session in reset password route = ", req.session)
	const result = validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.render("resetPassword", {error:error})
	} else {

		await userController.reset_password(req.body.password, req.session.user.remember_token)
		res.render("login", {success: "Password successfully changed! You may now log in."})
	}
})

router.get("/changePassword", (req, res) => {
	if(!req.session.user){

	}else{
		res.render("resetPassword", {title: "PACES Change Password"})
	}
})
  
/**
 * Routing for profile
 */
router.post('/profile', async (req, res) => {
	console.log(req.session.user)

  	let profile = {
    	state: req.body.state,
    	local_govt: req.body.local_govt,
    	ward: req.body.ward,
    	country: req.body.country,
    	jobstat: req.body.employment_status
	  }
	  let body = {
		firstname : req.body.firstname,
  		lastname : req.body.lastname,
  		phone : req.body.phone,
  		gender : req.body.gender,
		email : req.body.email,
		address : req.body.address,
	  }
  	
  // Hash password if provided else leave field

  if(req.body.password){
	bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(req.body.password, salt, (err, hash) => {
				body.password = hash
			})
		})
  }
  	
  	body.profile = profile

  	await User.findOneAndUpdate({email:body.email},{$set:body}, (err,user)=>{
    	if(err) return "update not succesful."
    	if(user){
			// If update successful, display profile page and repopulate the fields
      		res.render('profile', user)
    	}
  	})
})

router.get('/profile', async (req, res, next) => {
  	if(!req.session.user){
    	res.render('login')
  	} else {
    	user = req.session.user
		user.fullname = user.firstname + " " + user.lastname

		console.log("user from profile = ",user)
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


router.get('/home', async function(req, res) {
  	console.log("Testing persistent login", req.session)
  // Check for running session
  	if(!req.session.user){
    	res.redirect('/login')
  	}else{
		//   req.session.reload((err)=> {
		// 	  if(err) console.log(err)
		//   })
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
		console.log("Id before logout",req.sessionID)
		req.logout()
		req.session.destroy((error)=> {
			if(error){
				console.log(error)
			}else{
				res.redirect('/users/login')
			}
		})

	}
})


module.exports = router;