const express = require('express');
var router = express.Router();



router.get('/', function(req, res, next) {
  if(!req.session.user) res.render('index', {title: 'PLIDE', style: 'index.css'});
  else res.redirect('/users/home')
});


router.get('/about', function(req, res, next) {
  res.render('about', {title: 'About PLIDE'});
});

    
module.exports = router;