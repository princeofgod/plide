const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const moment = require('moment')
const groupController = require('../controllers/webControllers/group');
const userController = require('../controllers/webControllers/user');
const {groupValidation, userGroupValidator} = require("../config/validate");
const User = require('../model/user');
const { validationResult } = require('express-validator');
const { controllers } = require('chart.js');
const UserGroup = require('../model/userGroup');
const Schedule =require('../model/schedule');

let page ={
	title : 'PACES Groups',
	pageTitle : 'Group',
	newDate : moment().format("DD, MMMM YYYY")
}

/**
 * Routing for the add-group page
 */
router.get('/groups', async (req,res,next) => {
	if(!req.session.user){
	  	res.redirect('../users/login')
	} else {
		let user = req.session.user
		const groups = await Group.find({},{},{limit:3, sort:{timestamp:1}},(err,result) => {

		}).populate('leader', "firstname lastname")
		// --------------------------------------------

		if(groups.length <= 0){

		} else{
			groups.forEach(el => {
				el.date = moment(groups.createdAt).format("D MMM, YYYY")
			})
		}
		console.log("list of groups ========", groups[0])
		// --------------------------------------------
		const randomGroups = await groupController.getRandom()


		const schedule = await Schedule.find({},{}, (err, res) => {
			return res
		})


		console.log("User in groups = ",randomGroups)
	  	if(req.session.user.role !== "1"){
			page.title = 'PACES Admin Group';
			res.render('./users/usergroups', {user:user,page:page,randomGroups:randomGroups,groups:groups,schedule:schedule})
	  	}else{
			page.title = 'PACES Group';
			res.render('./admin/admingroup', {user:user,page:page,randomGroups:randomGroups,groups:groups,schedule:schedule})
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

		// Get email from the form
		leader = req.body["group_leader"].split(" ")[2].replace(")","").replace("(","")
		sec = req.body["group_sec"].split(" ")[2].replace(")","").replace("(","")

		// Search the db for user using mail as query
		leader = await userController.getOneByEmail(leader)
		sec = await userController.getOneByEmail(sec)

		let body = {
			name : req.body.title,
			description: req.body.description,
			leader: leader._id,
			secretary: sec._id,
		}

		let group = await groupController.createOne(body)
		console.log("GROUP ========", group)
		// Add the secretary and the leader to the User group with position

		let usersToBeAdded = [leader, sec]
		usersToBeAdded.forEach( async (el,index)=> {
			
			const newUserGroup = {
				user_id:el._id,
				group_id:group._id,
				position:""
			}
			if(index == 0) {
				newUserGroup.position = "leader"
			} else if(index == 1) {
				newUserGroup.position = "secretary"
			}

			await UserGroup.create(newUserGroup)
		})
		
		
		console.log(group)
		if (group === undefined) res.render('./admin/addgroup', {user:req.session.user, page:page,error:"Could not save group!"})
		else res.render("./admin/addgroup", {user:req.session.user, page:page,success:"Group saved"});
	}
})

router.post('/usergroup',userGroupValidator, async (req,res) => {
	const result =validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.render("./admin/addgroup", {error : "User not added"})
	} else {


		let group = await groupController.getOne(req.body["group_name"])


		// Get the email of the user from the string in the group field
			email = req.body.fullname.split(" ")[2].replace(")","").replace("(","")
			// console.log("Full name", fullname)
		const user = await userController.getOneByEmail(email);

		// const newUpdate = await Group.findOneAndUpdate({name:req.body["group_name"]},{$push:{members:user._id}},{
		// 	new:true,
		// 	upsert:true
		// },(err, group) =>{
		// 	if(err) console.log(err)
		// 	if(group){
		// 		return group
		// 	}
		// })
		let body = {
			user_id: user._id,
			group_id: group._id,
		};
		let newUserGroup = new UserGroup(body);
		newUserGroup.save()
			.then( user => {
				return user
			})
		
			res.render("./admin/addgroup", {success: "User successfully added to group!"})
			// Should return a modal with success
	}
	
})
router.get('/viewgroups', async (req, res) => {
	if(!req.session.user){
    	res.redirect('/users/login')
  	}else{
		const displayGRoups = await groupController.getAllPaginate(req);

		page.title = "PACES Group"
		page.pageTitle = "Group"
		console.log(displayGRoups)

		if(req.session.user.role === '1'){
			res.render('./admin/adminviewgroups', {user:req.session.user, groups:displayGRoups, page:page,estimate: displayGRoups.page * displayGRoups.limit})
		} else {
			res.render('./users/viewgroups', {user:req.session.user, groups:displayGRoups, page:page,estimate: displayGRoups.page * displayGRoups.limit})
		}
	}

})
router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})
module.exports = router;