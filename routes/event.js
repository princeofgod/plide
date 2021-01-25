const express = require('express');
const { eventValidation } = require('../config/validate');
const router = express.Router();
const moment = require("moment")
const eventController = require('../controllers/webControllers/event')
const userController = require('../controllers/webControllers/user')
const Event = require('../model/event');
const User = require('../model/user');
const {alert} = require("node-popup");
const popup = require('node-popup/dist/cjs.js');
const { validationResult } = require('express-validator');

let page = {
    newDate : moment().format("DD, MMMM YYYY"),
    title : 'PACES Events',
	pageTitle : 'Events'
}
// const eventController = require('../controllers/webControllers/event');

/**
 * Get the add events page
 * Only available to the admin
 */
router.get('/addevents', async (req,res,next) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		
		if(req.session.user.role !== "1"){
			res.redirect('../users/home')
		} else {
			let users = []
			await User.find({},{},{sort:{timestamp: -1}})
				.then( user => {
					for(let i = 0; i < user.length; i++){
						users.push(`${user[i].firstname} ${user[i].lastname} (${user[i].email})`)
					}
				})
			res.render('./admin/addevents', {page:page, user:req.session.user, users:users})
		}
	}
})

/**
 * Add events router
 */
router.post('/addevents',eventValidation, async (req,res,next) => {
	console.log("............")
    const result = validationResult(req)

    if(!result.isEmpty()){
        const error = result.array()[0].msg
        res.render('./admin/addevents', {error:error})
    } else {
		console.log("here")
		console.log("req.body ======", req.body)
		email = req.body["event_manager"].split(" ")[2].replace(")","").replace("(","")

		const managerId = await userController.getOneByEmail(email)
		console.log("managerId == ",managerId)
		req.body["event_manager"] = managerId._id
		console.log("------------- ", req.body["event_manager"] )
		await eventController.createOne(req.body)
		console.log("New req ==", req.body)
        res.render('./admin/addevents', {success : `Group has been created.`, page:page, user:req.session.user})                
    }
})


router.get('/events',async (req,res) => {
	if(!req.session.user){
		res.redirect("../users/login")
	} else {
        
		let user = req.session.user
		const events = await Event.find({},{},{limit:3, sort:{timestamp:1}},(err,result) => {

		})

		// --------------------------------------------------
		if(events.length <= 0){

		} else{
			events[0].createdAt = `${events[0].createdAt.getMonth()}, ${events[0].createdAt.getFullYear()}`
			events.forEach(el => {
				el.date = moment(events[0].createdAt).format("D MMM, YYYY")
			})
			events[0].newDate = moment(events[0].createdAt).format("D MMM, YYYY")
		}
		
		// --------------------------------------------------

		const randomEvents = await eventController.getRandom()
		
		if(user.role !== "1"){
			
			page.pageTitle = 'Event'
			page.title = 'PACES Events'
			res.render("./users/events", {user:user, page:page, events:events,randomEvents:randomEvents})
		} else {
			let user = req.session.user
			page.pageTitle = 'Event'
			page.title = 'PACES Admin Events'
			res.render("./admin/adminEvents",{user :user,page:page,events:events,randomEvents:randomEvents})
		}
	}
})

      
router.post('/updateEvent', async (req,res) => {
	const updatedEvent = await eventController.updateOne(req.body)
	
	if(!updatedEvent || updatedEvent == undefined){
		alert("Error Occured")
	} else {
		alert("Succesfully")
	}
})

router.get('/logout', (req,res) => {
	res.redirect('../users/logout')

	
})
  
module.exports = router; 