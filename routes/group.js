const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const groupController = require('../controllers/webControllers/group');
const {groupValidation} = require("../config/validate")

/**
 * Routing for the add-group page
 */
router.get('/addGroup', (req,res,next) => {
	if(!req.session.user){
	  	res.render('login')
	} else {
	  	if(req.session.user.role !== "1"){
			res.render('login', {title: 'PACES Login',message: 'No proper privilege to view this resource.'})
	  	}else{
			res.render('addgroup')
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