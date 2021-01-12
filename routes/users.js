/**
 * Declaring needed variables
 */
const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/webControllers/user');
const multer = require('multer');
const User = require('../model/user');
// const { render } = require('../app');
const moment = require('moment')
const {fileValidator, confirmRegisterToken, resetPasswordValidation, loginValidation,registerValidation, result, forgotPasswordValidation, tokenVerify} = require('../config/validate');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session)
const store = new MongoStore({
	uri: 'mongodb://localhost:27017/MVC1',
	collection: 'sessions'
  });

const createToken = id => {
	return jwt.sign({
		id
	}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/avatar')
      },
      filename: function (req, file, cb) {
		//   console.log(req.session.user._id)
		  let s = req.session.user._id.toString()
        cb(null, s+"."+file.originalname.split(".")[1])
	  },
    })
const upload = multer({storage : storage});

let page = {
	newDate : moment().format("DD, MMMM YYYY")
}

/**
 * Routing begins
 */
router.get('/login', function(req, res, next) {
  	res.render('login', {title: 'PACES User Login'});
});

/**
 * Route for the login url
 */
router.post('/login',loginValidation, async (req, res, next) => {
	const result = validationResult(req)
	
	if(!result.isEmpty()){
		error = result.array()[0].msg
		res.render("login", {error: error})
	}else{
		await User.findOne({email:req.body.email})
			.then(user => {
				req.session.user = user
				res.redirect("home")
			})
			.catch(error =>	console.log(error)
			)
	}
});
	
/**
 * Routing for forgot password
 */
router.get('/forgotPassword', function(req, res, next) {
	page.title = 'Reset Password'
  	res.render('forgotPassword', {page:page});
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
router.get('/confirm_account',confirmRegisterToken, async(req, res, next) => {
	// console.log("random characters = ", req.query.random_character)
	const result = validationResult(req)

	if(!result.isEmpty()){
		const error = result.array()[0].msg
		// res.send("Invalid confirmation token")
		res.render('login', {error: error})
	} else{
		await User.findOne({confirmation_token:req.query.random_character})
			.then(async (user) => {
				if(!user) console.log(error)
				if(user) {
					// if (err) console.log(err)
					if(user){
						console.log('user confirm = ',user)
						await User.findOneAndUpdate({email:user.email},{$set: {isActive : true} }, {new:true, runValidators:true}, (err,user) => {
							console.log("returned user = ", user)
							if(err) console.log(err)
							req.session.user = user
						})
					}
				}
			})
		res.redirect('/users/home')
	}
})

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

router.get('/profile', async (req, res, next) => {
  	if(!req.session.user){
    	res.redirect('..users/login')
  	} else {
    	user = req.session.user
		user.fullname = user.firstname + " " + user.lastname

		if(user.role === '1') res.render('./admin/adminprofile',{user :user, page:page})
		else res.render('./users/profile', {user :user, page:page})
	}
})

router.post('/profiledata', async (req,res) => {
	if(!req.session.user) res.redirect("../users/login")
	else {
		console.log("Form to update = ", req.body)
		let body = req.body
		console.log("Form to update = ", body)

		// Sort out all the profile data arrangement in a controller
		// At the end of the controller return the populated profile
		let profileData = await userController.populateProfile(body)

		// From here go to the controller and populate the table in d database using id as the reference 
		let user = await userController.updateOne(req.session.user._id, profileData)
		// rAssign the new value from the db to session
		// req.session.user = user
		// console.log('body', req.session.user._id)
		// Comes back  to the route
		// console.log("New User from route = ", user)
		req.session.user = user
		res.redirect('/users/profile')
		
	}
})


router.post('/avatar', upload.single("picture"), async (req, res, next) => {
	// Verify if the selected file is an image
	const result = validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
	} else {
		console.log("Request file = ", req.file.path)
		let user = req.session.user
		await User.findOneAndUpdate({_id:user._id},{$set:{profile_pic:req.file.filename}}, {new:true}, (err, user) => {
			if(err){
				console.log(err)
			}
			if(!user) console.log("No USer found")
			else {
				req.session.user = user
				res.redirect('profile')
			}
	})}
})


/**
 * Routing for the home page
 */
router.get('/home', async function(req, res) {
  	console.log("Testing persistent login", req.session)
  // Check for running session
  	if(!req.session.user){
    	res.redirect('/users/login')
  	}else{
		page.pageTitle = "Dashboard",
		page.title = 'PACES Admin Events'
		// Check for privileges
		if(req.session.user.role === '1'){
			res.render('./admin/adminDashboard', {user:req.session.user, page:page})
		} else {
      		res.render('./users/userDashboard', {user:req.session.user, page:page})
    	}   
  	}  
});

   
/**
* Routing for the payment page
*/
router.get('/payment', (req,res,next) => {
    if(!req.session.user){
      	res.redirect('/users/login')
    }else{
		let user = req.session.user
            page.pageTitle = "Dashboard"
            page.title = 'PACES Admin Events'
           	res.render('payment', {user:user, page:page})
    }
})

router.get('/payment-form', (req,res,next) => {
    if(!req.session.user){
      	res.redirect('/users/login')
    }else{
		page.pageTitle = "Fund a course"
		page.title = 'PACES Fund a course'
        res.render('./users/payment-form', {page:page, user:req.session.user})
    }
})
  
  
router.get('/funding', function(req, res, next) {
	if(!req.session.user) res.redirect('/users/login')
 	else {
		let user = req.session.user
		page.pageTitle = "Fund a course"
		page.title = 'PACES Fund a course'
		if(user.role === '1') res.render('./admin/adminfundACourse', {user:user, page:page})
		res.render('./users/fundACourse', {user:user, page:page});
	 }
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