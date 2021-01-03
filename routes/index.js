const express = require('express');
const login = require('../controllers/webControllers/user').login;
const { controllers } = require('chart.js');
const { sessionChecker } = require('../app');
const { Store } = require('express-session');
var router = express.Router();
const session = require('express-session')
const moment = require('moment')
const bcrypt = require('bcryptjs')


router.get('/', function(req, res, next) {
  res.render('index', {title: 'PLIDE', style: 'index.css'});
});


router.get('/about', function(req, res, next) {
  res.render('about', {title: 'About PLIDE'});
});

// Routing for the home dashboard




router.get('/categories', (req,res,next) => {
  if(!req.session.user){
    res.render('login')
  }else{
    if(req.session.user.role !== '1' ){
      // let error = 
      res.render('login', {error:"You do not have enough privilege to access the requested page"})
    } else{
      res.render('categories',{title: 'PACES categories', pageTitle: 'Fund a course'})

    }
  }
})


/**
 *Routing for add-category page 
 **//
router.get('/add-category', (req,res,next) => {
  if(!req.session.user){
    res.render(login)
  }
  res.render('add-category', {title: 'PACES Admin Category', pageTitle: 'Categories'})
})


/**
 * Routing for add-candidates
 */
router.get('/add-candidates', (req,res,next) => {
  if(!req.session.user){
    res.render('login')
  }else{
    if(req.session.user.role !== "1"){
      res.render('add-candidates', {title: 'PACES Admin Category', pageTitle: 'Categories'})
    }
  }
})

/**
 * Routing for successful payment
 **/
router.get('/successful-payment', (req,res,next) => {
	if(!req.session.user){
		res.render('login')
	}else{
		res.render('successful-payment', {title: 'PACES Admin Category', pageTitle: 'Categories'})
	}
})


    
module.exports = router;