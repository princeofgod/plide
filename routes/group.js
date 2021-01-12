const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const moment = require('moment')
const groupController = require('../controllers/webControllers/group');
const {groupValidation} = require("../config/validate")

let page ={
	title : 'PACES Groups',
	pageTitle : 'Group',
	newDate : moment().format("DD, MMMM YYYY")
}
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
			res.render('./users/usergroups', {user:user,page:page})
	  	}else{
			res.render('./admin/admingroup', {user:user,page:page})
	  	}
	}
})

router.get('/addgroup', (req,res) => {
	if(!req.session.user) res.redirect('../users/login')
	else{
		if(req.session.user.role !== '1') res.redirect('./groups')
		else res.render('./admin/addgroup', {user:req.session.user, page:page})
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
      	res.render("./admin/addgroup", {user:user, page:page,success:"Group saved"});
    })
})

router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})
module.exports = router;