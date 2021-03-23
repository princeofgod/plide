const express = require('express');
const { eventValidation,scheduleVerification } = require('../config/validate');
const router = express.Router();
const moment = require("moment")
const eventController = require('../controllers/webControllers/event')
const userController = require('../controllers/webControllers/user')
const Event = require('../model/event');
const User = require('../model/user');
const EventNominee = require('../model/eventNominee');
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

				const schedule = await Schedule.find({},{}, (err, res) => {
					return res
				})
			res.render('./admin/addevents', {page:page, user:req.session.user, users:users, schedule:schedule})
		}
	}
})

/**
 * Add events router
 */
router.post('/addevents',eventValidation, async (req,res,next) => {
    const result = validationResult(req)

    if(!result.isEmpty()){
        const error = result.array()[0].msg
        res.render('./admin/addevents', {error:error})
    } else {


		if(req.body.button === "Save"){
			req.body.published = "true"
		} else {
			req.body.published = "false"
		}
		email = req.body["event_manager"].split(" ")[2].replace(")","").replace("(","")

		const managerId = await userController.getOneByEmail(email)
		// --------------------------------------------------------------------
		if (req.body["event_nominees"] != ''){
			let nominees = req.body["event_nominee"].split(",")
			
			const candidates = [];
	
			for(let i = 0;i < nominees.length; i++){
				let email = nominees[i].split(" ")[2].replace(")","").replace("(","");
				let candidate = await userController.getOneByEmail(email);
		
	
				candidates.push({
					id:candidate._id,
					firstname:candidate.firstname,
					lastname:candidate.lastname,
					phone:candidate.phone,
					email:candidate.email,
				});
			}
			req.body.nominees = candidates;
		}
		// const nnominees = [];
		// --------------------------------------------------------------------

		req.body["event_manager"] = managerId._id

		await eventController.createOne(req.body)
		
	}
	if (candidates.length <= 0){
		res.render('./admin/addevents', {success : `Event has been created.`, page:page, user:req.session.user})  
	} else {
		req.session.candidates = candidates
		next()
	}
})

router.post('/addevents', async (req, res) => {
	// Saving to the event nominee table
	const candidates = req.session.candidates;
		// _______________________________________
		const event = await eventController.getOne(req.body["event_title"]);
		for(let i = 0; i < candidates.length; i++){
			const newEventNominees = new EventNominee({
				userID: candidates[i].id,
				eventID: event._id
			});

			newEventNominees.save().then( response => {
				if(response){
					console.log(response);
				};
			});
		};
		req.session.candidates = '';
		// _______________________________________
        res.render('./admin/addevents', {success : `Event has been created.`, page:page, user:req.session.user})  
})

router.get('/events',async (req,res) => {
	if(!req.session.user){
		res.redirect("../users/login")
	} else {
        
		let user = req.session.user
		const events = await Event.find({},{},{limit:3, sort:{start_date:1}},(err,result) => {

		}).populate('event_manager')
		// --------------------------------------------------
		if(events.length <= 0){

		} else{
			events.forEach(el => {
				el.date = moment(el["start_date"]).format("D MMM, YYYY")
			})
		}
		// --------------------------------------------------

		const schedule = await Schedule.find({},{}, (err, res) => {
			return res
		})

		const publishedEvents = await eventController.getRandom()

		if(user.role !== "1"){
			
			page.pageTitle = 'Event'
			page.title = 'PACES Events'
			res.render("./users/events", {user:user, page:page, events:events, schedule: schedule, publishedEvents:publishedEvents})
		} else {
			let user = req.session.user
			page.pageTitle = 'Event'
			page.title = 'PACES Admin Events'
			res.render("./admin/adminEvents",{user :user,page:page,events:events , schedule: schedule, publishedEvents:publishedEvents})
		}
	}
})


router.get('/logout', (req,res) => {
	res.redirect('../users/logout')
})

router.post('/delete', async (req, res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		if(req.session.user.role !== '1') {
			res.redirect('../users/home')
		} else {
			console.log(req.body)
			const deletedEvent = await eventController.deleteOne(req.body["event_title"])
			// if(!deletedEvent || deletedEvent == undefined){
				res.redirect('./viewevents')
			// }
		}
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

		const body = await helper.setScheduleTime(req.body)
		await Schedule.create(body)
		.then(value => {
	
		})
		res.redirect("./events")
	}
})

router.post('/update', async (req, res) => {
	
		email = req.body["event_manager"].split(" ")[2].replace(")","").replace("(","")
		const manager = await userController.getOneByEmail(email)

		const body = {
			old_title : req.body["old_title"],
			event_manager : manager._id,
			event_title: req.body["event_title"],
			event_description: req.body["event_description"],
			start_date: req.body["start_date"],
			end_date: req.body["end_date"]
		};

		const updatedEvent = await eventController.updateOne(body);
		
        res.render('./admin/addevents', {success : `Group has been created.`, page:page, user:req.session.user})
	
})

router.get('/viewevents', async (req, res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		const events = await eventController.getAllPaginated(req)
		let users = []
			await User.find({},{})
				.then( user => {
					for(let i = 0; i < user.length; i++){
						users.push(`${user[i].firstname} ${user[i].lastname} (${user[i].email})`)
					}
				})

		if(req.session.user.role === '1'){
			page.title = 'PACES Admin Events'
			res.render('./admin/viewevents', {user:req.session.user, page:page, events:events, estimate:events.page * events.limit, users:users})
		} else {
			page.title = 'PACES Events'
			res.render('./users/viewevents', {user:req.session.user, page:page, events:events, estimate:events.page * events.limit})
		};
	};
});

router.post('/addnominee', async (req, res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
	const data = req.body;

	// Get the id of the person added
	const email = data.users.split(" ")[2].replace("(","").replace(")", "")
	const nominee = await userController.getOneByEmail(email);
	// Get the event Id
	const event = await eventController.getOne(data.event_title);

	// Get the other data 
	const newNominee = {
		firstname : nominee.firstname,
		lastname : nominee.lastname,
		phone : nominee.phone,
		email : nominee.email
	}

	const body = {
		userID : nominee._id,
		eventID : event._id
	}

	const newNomine = new EventNominee(body)
	newNomine.save()
		.then( event => {
			return event
		}).catch( err => console.log(err))
	
const returned = await eventController.updateNominee(event.event_title, newNominee)
console.log(returned)
	}
})
router.get('/view-event-info', async (req,res) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		if(req.session.user.role !== '1'){
			res.redirect('../users/home')
		} else {
			const events = await eventController.getOneById(req.query.id)
			const users = await userController.getAllNoPagination()
			console.log(events.createdAt)
			events.date = moment(events.createdAt).format("DD, MMMM YYYY")
			console.log(users)
			const nominees =[]
			users.forEach( el=> {
				nominees.push(`${el.firstname} ${el.lastname} (${el.email})`);
			})
			const schedule = await Schedule.find({},{}, (err, res) => {
				return res
			})
			res.render('./admin/full-info-event', {user:req.session.user, page:page, event: events, users: nominees, schedule:schedule})
		}
	}
})
router.post('/add-nominee', async (req, res) => {
	// Save to nominee field in the events table
	// and save with both event id and user id in the event nominee table

	req.body.nominee = req.body.nominee.split(",");
	const candidates =[];

	// Save to the events field in the events model
	for(let i = 0;i < req.body.nominee.length; i++){
		let email = req.body.nominee[i].split(" ")[2].replace(")","").replace("(","");
		let candidate = await userController.getOneByEmail(email);

		candidates.push({
			id:candidate._id,
			firstname:candidate.firstname,
			lastname:candidate.lastname,
			phone:candidate.phone,
			email:candidate.email,
		});
	}

	for(let i = 0;i < candidates.length; i++){
		const contest = await eventController.updateNominee(req.body.event,candidates[i]);
	}
	
	// Save to the event nominee model
	const event = await eventController.getOne(req.body["event"]);
	for(let i = 0; i < candidates.length; i++){
		const newEventNominees = new EventNominee({
			userID: candidates[i].id,
			eventID: event._id
		});

		newEventNominees.save().then( response => {
			if(response){
				console.log(response);
			};
		});
	};

	res.end("Success !!!");
})
  
module.exports = router; 