const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const groupController = require('../controllers/webControllers/group');
const {groupValidation} = require("../config/validate")

/**
 * Routing for the add-group page
 */
router.get('/groups', (req,res,next) => {
	if(!req.session.user){
	  	res.render('login')
	} else {
		let user = req.session.user 
		console.log("User in groups = ",user)
	  	if(req.session.user.role !== "1"){
			res.render('usergroups', user)
	  	}else{
			res.render('admingroup', user)
	  	}
	}
})


    /**
     *Saving the groups
     **/
router.post('/addgroup', groupValidation, (req,res,next) => {
    console.log("2", req.body)
    let body = req.body;
    body.name = req.body.title;
    let newGroup = new Group(body);
    newGroup.save()
    	.then(item => {
        // Renders the page of the new added
      	res.render("addgroup", {success:"Group saved"});
    })
})

module.exports = router;