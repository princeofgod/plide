const express = require('express');
const { eventValidation,scheduleVerification } = require('../config/validate');
const router = express.Router();
const moment = require("moment")
const eventController = require('../controllers/webControllers/event')
const userController = require('../controllers/webControllers/user')
const Event = require('../model/event');
const User = require('../model/user');
const {alert} = require("node-popup");
const popup = require('node-popup/dist/cjs.js');
const { validationResult } = require('express-validator');
const Schedule = require('../model/schedule');
const { helpers } = require('handlebars');
const helper = require('../config/helpers')

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
	// console.log(req.body)
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
		if(req.body.button === "Save"){
			req.body.published = "true"
		} else {
			req.body.published = "false"
		}
		email = req.body["event_manager"].split(" ")[2].replace(")","").replace("(","")

		const managerId = await userController.getOneByEmail(email)
		console.log("managerId == ",managerId)
		req.body["event_manager"] = managerId._id
		console.log("------------- ", req.body["event_manager"] )
		await eventController.createOne(req.body)
		console.log("New req ==", req.body)
        res.render('./admin/addevents', {success : `Event has been created.`, page:page, user:req.session.user})                
    }
})


router.get('/events',async (req,res) => {
	if(!req.session.user){
		res.redirect("../users/login")
	} else {
        
		let user = req.session.user
		const events = await Event.find({},{},{limit:3, sort:{timestamp:1}},(err,result) => {

		}).populate('event_manager')
		// console
		// --------------------------------------------------
		if(events.length <= 0){

		} else{
			events.forEach(el => {
				el.date = moment(el["start_date"]).format("D MMM, YYYY")
			})
		}
		console.log("events--------", events[0])
		// --------------------------------------------------

		const schedule = await Schedule.find({},{}, (err, res) => {
			return res
		})

		const randomEvents = await eventController.getRandom()
		
		if(user.role !== "1"){
			
			page.pageTitle = 'Event'
			page.title = 'PACES Events'
			res.render("./users/events", {user:user, page:page, events:events,randomEvents:randomEvents, schedule: schedule})
		} else {
			let user = req.session.user
			page.pageTitle = 'Event'
			page.title = 'PACES Admin Events'
			res.render("./admin/adminEvents",{user :user,page:page,events:events,randomEvents:randomEvents , schedule: schedule})
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

router.post('/delete', async (req, res) => {
	// console.log(req.body)
	const deletedEvent = await eventController.deleteOne(req.body["event_title"])
	if(!deletedEvent || deletedEvent == undefined){
		res.redirect('events')
	}
})

router.get("/schedule", async (req, res) => {	
	if(!req.session.user){
		res.redirect('../users/login')
	} else {		
		if(req.session.user.role !== "1"){
			res.redirect('../users/home')
		} else {			
			res.render('./admin/schedule', {page:page, user:req.session.user})
		}
	}
})


router.post("/addschedule", scheduleVerification, async (req, res) => {
	// Get the date and set the time
	// before storing to db
	const result = validationResult(req)
	if(!result.isEmpty()){
		const error = result.array()[0].msg
		res.send(error)
	} else {
		console.log("Schedule ==== ", req.body)
		const body = await helper.setScheduleTime(req.body)
		await Schedule.create(body)
		.then(value => {
			console.log("Schedule saved ")
		})
		res.redirect("./events")
	}
})

router.post('/update', async (req, res) => {
	console.log("Update request ===== ", req.body)
	// Using the event manager field of the req.body, get the user id 
	// console.log("here")
	// 	console.log("req.body ======", req.body)
		email = req.body["event_manager"].split(" ")[2].replace(")","").replace("(","")

		const manager = await userController.getOneByEmail(email)
// reassign the id to event_manager
		// console.log("managerId == ",managerId)
		const body = {
			old_title : req.body["old_title"],
			event_manager : manager.Id,
			event_title: 'Test',
			event_description: 'kjnn,,n,',
			start_date: '2021-01-29',
			end_date: '2021-01-29'
		}
		// console.log("------------- ", req.body["event_manager"] )
		const updatedEvent = await eventController.updateOne(body)
		console.log("New req ==", updatedEvent)
		
        res.render('./admin/addevents', {success : `Group has been created.`, page:page, user:req.session.user})
	
	// then send to the event controiller for saving

	// const updatedEvent = await eventController.updateOne(req.body)
})
  
module.exports = router; 