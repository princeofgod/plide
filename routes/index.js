const express = require('express');
const controller = require('../controllers/webControllers/controllers');
const User = require('../public/javascripts/user');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {title: 'PLIDE', style: 'index.css'});
});

router.get('/about', function(req, res, next) {
  res.render('about', {title: 'About PLIDE'});
});

router.get('/confirm_account', async(req, res, next) => {
  const permit = await User.findOne({confirmation_token: req.query.random_character});
  const permission = permit && permit.permission;

  try {

    if((permission.includes('user')) === true){

      await controller.confirm_account(req.query.random_character);

      res.redirect('/userDashboard', 200, {title: 'PLACES User', pageTitle: 'Dashboard', style: 'userDashboard.css'});

    } else if((permission.includes('admin')) === true){

      await controller.confirm_account(req.query.random_character);

      res.redirect('/adminDashboard', 200, {title: 'PLACES User', style: 'userDashboard.css'});
    }
  
  } catch (error) {
    console.log(error);
  }
});

router.get('/forgotPassword', function(req, res, next) {
  res.render('forgotPassword', {title: 'Reset Password', style: 'forgotPassword.css'});
});

router.get('/reset_password/:random_character',function(req, res, next) {
  res.render('resetPassword', {title: 'PLACES reset password', style: 'forgotPassword.css'}, req.params.random_character)
})

router.get('/register',function(req, res, next) {
  res.render('register', {title: 'register', style: 'register.css'});
})

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'PLACES User Login', style: 'login.css'});
});

router.get('/profile', function(req, res, next) {
  res.render('profile', {title: 'PLACES profile', style: 'userDashboard.css'})
})

router.get('/funding', function(req, res, next) {
  res.render('fundACourse', {title: 'PLACES Fund a course', pageTitle: 'Fund a course'});
});

router.get('/events', function(req, res, next) {
  res.render('events', {title: 'PLACES events', pageTitle: 'Events',style: 'events.css'});
});

router.get('/adminDashboard', function(req, res, next) {
  res.render('adminDashboard', {title: 'PLACES Admin', style: 'adminDashboard.css'});
});

router.get('/userDashboard', function(req, res, next) {
  res.render('userDashboard', {title: 'PLACES User', style: 'userDashboard.css'});
});
router.get('/resetpassword', (req,res,next) => {
  res.render('resetpassword', {title: 'PLACES Change Password'});
});
router.get('/groups', (req,res,next) => {
  res.render('usergroups', {title: 'PLACES Groups', pageTitle: 'Groups'});
});

module.exports = router;