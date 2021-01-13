const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const moment = require('moment')
const groupController = require('../controllers/webControllers/group');
const {groupValidation} = require("../config/validate");
const User = require('../model/user');
const { validationResult } = require('express-validator');

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
	  	res.redirect('../users/login')
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

router.get('/addgroup', async (req,res) => {
	if(!req.session.user) res.redirect('../users/login')
	else{
		if(req.session.user.role !== '1') res.redirect('./groups')
		else {
			let users = []
			await User.find({},{},{sort:{timestamp: -1}})
				.then( user => {
					for(let i = 0; i < user.length; i++){
						users.push(`${user[i].firstname} ${user[i].lastname}`)
					}
				})
			res.render('./admin/addgroup', {user:req.session.user, page:page, users:users})
		}
	}
})


/**
*Saving the groups
**/
router.post('/addgroup', groupValidation, async (req,res,next) => {
	const result =validationResult(req)

	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.render('./admin/addgroup', {error:error})
	} else {
		console.log("2", req.body)
		let body = {
			name : req.body.title,
			description: req.body.description,
			leader: req.body.group_leader,
			secretary: req.body.group_sec,
		}

		let group = await groupController.createOne(body)
		console.log(group)
		if (group === undefined) res.render('./admin/addgroup', {user:req.session.user, page:page,error:"Could not save group!"})
		else res.render("./admin/addgroup", {user:req.session.user, page:page,success:"Group saved"});
	}
})

router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})
module.exports = router;