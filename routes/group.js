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
const { populate } = require('../model/group');

let pages = {
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
		
		// --------------------------------------------
		const randomGroups = await groupController.getRandom()

		const schedule = await Schedule.find({},{}, (err, res) => {
			return res
		})
		const unapprovedCount = await groupController.getUnapprovedCount(req)
		console.log('unapprovedCount=-================', unapprovedCount)

	  	if(req.session.user.role !== "1"){
			page.title = 'PACES Admin Group';
			res.render('./users/usergroups', {user:user,page:pages,randomGroups:randomGroups,groups:groups,schedule:schedule})
		}else{
			page.title = 'PACES Group';
			res.render('./admin/admingroup', {user:user,page:pages,randomGroups:randomGroups,groups:groups,schedule:schedule, unapprovedCount:unapprovedCount})
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

			const schedule = await Schedule.find({},{}, (err, res) => {
				return res
			})

			page.title = 'PACES Admin Group';
			res.render('./admin/addgroup', {user:req.session.user, page:pages, users:users, groups:groups,schedule:schedule})
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
		console.log(req.body)

		// const save = await groupController.create(req.body)
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
		// Add the secretary and the leader to the User group with position
		
		let usersToBeAdded = [leader, sec]
		usersToBeAdded.forEach( async (el,index)=> {
			
			const newUserGroup = {
				user_id:el._id,
				group_id:group._id,
				position:"",
				approved: true
			}
			if(index == 0) {
				newUserGroup.position = "leader"
			} else if(index == 1) {
				newUserGroup.position = "secretary"
			}
			
			await UserGroup.create(newUserGroup)
		})

		
		// const nnominees = [];
		

		console.log(group)
		if (group === undefined) res.render('./admin/addgroup', {user:req.session.user, page:page,error:"Could not save group!"})
		else {
			req.session.members = req.body
			next();
			// res.render("./admin/addgroup", {user:req.session.user, page:page,success:"Group saved"});
		}
	}
});

router.post('/addgroup', async (req,res) => {
	// Adding the members
	const data = req.session.members;

	// console.log("dtata sent from the previous middleware +++++++++++++++", data);

	if(data["group_members"]){
		// console.log("i am here ooooooooooo")
		let members = data["group_members"].split(",");
	const candidates = [];

	for(let i = 0;i < members.length; i++){
		let email = members[i].split(" ")[2].replace(")","").replace("(","");
		let candidate = await userController.getOneByEmail(email);

		// console.log("candidate from email +++++++++++",candidate);

		candidates.push({
			_id:candidate._id,
			firstname:candidate.firstname,
			lastname:candidate.lastname,
			phone:candidate.phone,
			email:candidate.email,
			approved : true
		})
	}
	
	// console.log("Stored up candidates ++++++++++++++++++",candidates);

	for(let i = 0;i < candidates.length; i++){
		console.log(`candidates ========== ${candidates[i]}`)
			const updatemember = await groupController.updateMember(data.title,candidates[i]);

			// console.log("UPDATED MEMBER +++++++++++++++++++++ ,", updatemember);
		}
		req.session.redirecter = req.url
		// res.render("./users/successful-payment", {user:req.session.user, page:page,success:"Group saved"});
		res.redirect("./success")
} else {
	res.redirect("./success")
	// res.render("./users/successful-payment", {user:req.session.user, page:page,success:"Group saved"});

};

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
			
		const user = await userController.getOneByEmail(email);

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
		res.redirect('../users/login')
	} else {
		const limit = req.query.limit || 10;
		const page = req.query.page || 1;
		// const displayGroups = Group.paginate({}, {page:page, limit:limit,pagination:true,sort:{name:1}, populate: 'leader secretary', })
		const displayGRoups = await Group.paginate({'members.email': {$ne :req.session.user.email}}, {page:page, limit:limit,pagination:true,sort: {name:1},populate: 'leader secretary'}).then(items => {
			// console.log("items==============",items)
			return items;
		})
		
		if(req.session.user.role === '1'){
			page.title = "PACES Admin Group"
			res.render('./admin/viewgroups', {user:req.session.user, groups:displayGRoups, page:pages,estimate: displayGRoups.page * displayGRoups.limit})
		} else {
			page.title = "PACES Group"
			res.render('./users/viewgroups', {user:req.session.user, groups:displayGRoups, page:pages,estimate: displayGRoups.page * displayGRoups.limit})
		}
		
	}

})

/**
 * Handles all group view
 */
router.get('/view-group-info', async (req, res) => {
	console.log(req.query.id)

	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		const groups = await groupController.getOneById(req.query.id)
		const users = await userController.getAllNoPagination()
		// console.log(groups.createdAt)
		groups.date = moment(groups.createdAt).format("DD, MMMM YYYY")

		const members =[]
		users.forEach( el=> {
			members.push(`${el.firstname} ${el.lastname} (${el.email})`);
		})
		const schedule = await Schedule.find({},{}, (err, res) => {
			return res
		})
		if(req.session.user.role == '1'){
			page.title = "PACES Admin Group"
			
			res.render('./admin/full-info-group', {user:req.session.user, page:pages, group: groups, users: members, schedule:schedule})
		} else {
			page.title = "PACES Group"
			res.render('./users/full-info-group', {user:req.session.user, page:pages, group: groups, users: members, schedule:schedule})
		}
	}
})
/**
 * Routing that controls request approval
 */
router.get('/approverequest', async (req,res) => {
	const awaitingApproval = await groupController.getUnapproved(req)
	
	res.render('./admin/approvepage', {user:req.session.user, page:pages, awaitingApproval : awaitingApproval,estimate: awaitingApproval.page * awaitingApproval.limit })
})

/**
 * Handles user's request to join a group
 */
router.get('/join', async (req,res) => {
	
	// console.log("Requesting to join group",req.query);
	
	const newUserGroup = new UserGroup({
		user_id : req.session.user._id,
		group_id : req.query.id,
		approved : false,
		position : 'member'
	});

	newUserGroup.save().then( item => {
		console.log(item)
	}).catch(err => console.log(err));

	res.redirect('./groups');

})

router.get('/approve', async (req, res) => {
	console.log(req.query)
	// Check if 
	const t = await UserGroup.findOneAndUpdate({$and :[{user_id : req.query.user},{group_id : req.query.group}]},{$set : {approved : true}},{new:true}, (err, item) => {
		if(err) console.log(err);
		if(item) {
			return item
		}
	})
	const user = {};
	await User.findOne({_id:req.query.user}).then(item => {
		// user = {
			user._id = item._id;
			user.firstname = item.firstname;
			user.lastname = item.lastname;
			user.phone = item.phone;
			user.email = item.email;	
		// }
		return item;
	}).catch(err => console.log(err))

	// Send the users info to the group.members
	await Group.findOneAndUpdate({_id:req.query.group}, {$push:{members: user}}, {new:true})

	res.redirect('approverequest');
})
/**
 * Handles admin adding members to a group
 */
router.post('/add-member', async (req, res) => {
	// Save to member field in the events table
	// and save with both event id and user id in the usergroups table
// console.log(req.body)
	req.body.member = req.body.member.split(",");
	const candidates =[];

	// Save to the events field in the events model
	for(let i = 1;i <= req.body.member.length; i++){
		let email = req.body.member[i].split(" ")[2].replace(")","").replace("(","");
		let candidate = await userController.getOneByEmail(email);

		candidates.push({
			_id:candidate._id,
			firstname:candidate.firstname,
			lastname:candidate.lastname,
			phone:candidate.phone,
			email:candidate.email,
			approved : true
		});
		// console.log(`Candidats ====== ${req.body.member[i]}`)
	}

	for(let i = 0;i < candidates.length; i++){
	// console.log(`candidates ========== ${candidates[i]}`)
		const contest = await groupController.updateMember(req.body.group,candidates[i]);
	}
	
	// Save to the usergroup model
	const group = await groupController.getOne(req.body["group"]);
	// console.log(group)
	for(let i = 0; i < candidates.length; i++){
		const newGroupMembers = new UserGroup({
			user_id: candidates[i].id,
			group_id: group._id,
			// position: 'member'
		});

		newGroupMembers.save().then( response => {
			if(response){
				console.log(response);
			};
		});
	};

	res.redirect('./viewgroups');
})

/**
 * Handles deleting of groups from the database
 */
router.get('/delete', async (req, res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {

		if(req.session.user.role !== '1') {
			res.redirect('../users/home')
		} else {
			if(!req.query.id){
				res.redirect('./viewgroups')
			} else {
				// Delete from the group table
				const deletedGroup = await groupController.deleteOne(req.query.id)
					res.redirect('./viewgroups')
				}
				// Delete info in the usergroups
				const userGroupRemove = await groupController.deleteManyUserGroups( req.query.id )

		}

	}
})

router.post('/update', async (req, res) => {
	email1 = req.body["leader"].split(" ")[2].replace(")","").replace("(","")
	email2 = req.body["secretary"].split(" ")[2].replace(")","").replace("(","")
	const leader = await userController.getOneByEmail(email1)
	const secretary = await userController.getOneByEmail(email2)

	const body = {
		old_title : req.body["old_title"],
		leader : leader._id,
		secretary : secretary._id,
		name: req.body["name"],
		description: req.body["description"],
	};
	const updatedGroup = await groupController.updateOne(body);
	
	res.redirect('./viewgroups')

})

router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})

router.get('/usersgroup', async (req, res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {

		const limit = req.query.limit || 10;
		const page = req.query.page || 1;
		// console.log(req.session.user)
		// console.log('nbwd s===============')
		const usersgroup =await UserGroup.paginate({user_id : req.session.user._id}, {page:page, limit:limit,pagination:true,sort: {name:1},populate :[{path: 'group_id',select: '', populate :[{path : 'leader'}, {path:'secretary'}]}]}).then(items => {
			
			// console.log("items==============",items);
			return items
		});

		if(req.session.user.role == '1'){
			// console.log("I am here")
			page.title = 'PACES Admin Fund a Cause';
			page.pageTitle = 'Fund a cause' ;
			res.render('./admin/usersgroup', {user:req.session.user, page:pages, usersgroup: usersgroup,estimate: usersgroup.page * usersgroup.limit })
		} else {
			// console.log("I am here")
			page.title = 'PACES group';
			page.pageTitle = 'Group' ;
			console.log("PAge ", page)
			res.render('./users/usersgroup', {user:req.session.user, page:pages, usersgroup: usersgroup,estimate: usersgroup.page * usersgroup.limit })
		}
		
	}
})

router.post('/leave-group', async (req, res) => {
	console.log(req.body);
	const deleted = await Group.updateOne({_id:req.body.id}, {$pull: {"members":{"email":req.session.user.email}}})
	res.redirect('usersgroup');
})

router.get('/success', (req, res) => {
	console.log("Url that redirected here----------", req.url)
	if(!req.session.user){
		res.redirect("../users/home")
	} else {
		console.log("REQUEST=================",req.rawHeaders[11].split("/")[req.rawHeaders[11].split("/").length-1])
		// if(req.session.redirecter == "/addgro")
		const success = "Group saved successfully!"
		res.render("./admin/successful-payment", {user:req.session.user, page:pages,success:success});
	}
})

module.exports = router;