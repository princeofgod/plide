const express = require('express');
const router = express.Router();

/**
 * Post router to add candidates
 * Only available to the admin
 */
router.post('/add-candidates', (req,res, next) => {

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
			res.render('candidates', {title: 'PACES Candidates', pageTitle: 'Fund a cause'})
  
      	} else {
        	res.render('candidates', {title: 'PACES Candidates', pageTitle: 'Fund a cause'})
      	}
    }
})
  
module.exports = router; 