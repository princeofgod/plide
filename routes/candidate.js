const express = require('express');
const router = express.Router();
// const Candidates = require('../model/candidates');
// const candidateController = require('../controllers/webControllers/candidate');

/**
 * Post router to add candidates
 * Only available to the admin
 */
router.post('/add-candidates', (req,res, next) => {
    // let body = req.body;
    // body.name = req.body.candidate_name;
    // body.description = req.body.candidate_description;

})

/**
 * Get router for the candidates page
 */
router.get('/candidates', (req,res,next) => {
    if(!req.session.user){
      	res.render('login')
    }else{
      // Check for privileges and render specific pages
		user= req.session.user
		if(user.role === '1'){
			res.render('candidates', {title: 'PACES Candidates', pageTitle: 'Fund a course'})
  
      	} else {
        	res.render('candidates', {title: 'PACES Candidates', pageTitle: 'Fund a course'})
      	}
    }
})
  
module.exports = router; 