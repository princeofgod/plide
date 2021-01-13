const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const moment = require('moment')
const groupController = require('../controllers/webControllers/group');
const userController = require('../controllers/webControllers/user');
const {groupValidation} = require("../config/validate");
const User = require('../model/user');
const { validationResult } = require('express-validator');
const { controllers } = require('chart.js');
const UserGroup = require('../model/userGroup');

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
						users.push(`${user[i].firstname} ${user[i].lastname} (${user[i].email})`)
					}
				})

			let groups = []
			let groupList = await groupController.getAll()
				console.log("groupList = ", groupList)
			for(let i = 0; i < groupList.length; i++){
				groups.push(`${groupList[i].name}`)
			}

			res.render('./admin/addgroup', {user:req.session.user, page:page, users:users, groups:groups})
		}
	}
})

/**
*Saving the groups
**/
router.post('/addgroup', groupValidation, async (req,res) => {
	const result =validationResult(req)

	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.render('./admin/addgroup', {error:error})
	} else {
		console.log(req.body)

		leader = req.body["group_leader"].split(" ")[2].replace(")","").replace("(","")
		sec = req.body["group_sec"].split(" ")[2].replace(")","").replace("(","")

		// Search the db for user using mail as query
		leader = await User.findOne({email:leader},(err, user) => {
			if(err) console.log(err)
		})
		sec = await User.findOne({email:sec},(err, user) => {
			if(err) console.log(err)
		})
		
		let body = {
			name : req.body.title,
			description: req.body.description,
			leader: leader._id,
			secretary: sec._id,
		}

		console.log('leader._id = ',leader._id)
		let group = await groupController.createOne(body)
		console.log(group)
		if (group === undefined) res.render('./admin/addgroup', {user:req.session.user, page:page,error:"Could not save group!"})
		else res.render("./admin/addgroup", {user:req.session.user, page:page,success:"Group saved"});
	}
})

router.post('/updateEvent', async (req,res) => {
	const result =validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
		// Render modal with error page
	} else {

		let group = await groupController.getOne(req.body["group_name"])
			// GO TO CONTROLLER AND GET USERS
		let user = await userController.getOneByEmail(req.body["fullname"])
		
		let body = {
			userID: user._id,
			groupID: group._id
		}

		let newUserGroup = new UserGroup({body})
		newUserGroup.save()
			.then()
	}
	
})
router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})
module.exports = router;