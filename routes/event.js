const express = require('express');
const { eventValidation } = require('../config/validate');
const router = express.Router();
const moment = require("moment")

const Event = require('../model/event');

// const eventController = require('../controllers/webControllers/event');

/**
 * Get the add events page
 * Only available to the admin
 */
router.get('/addevents', (req,res,next) => {
	if(!req.session.user){
		res.render("login", {error: "You need to be logged in to access this page"})
	} else {
		if(req.session.user.role !== "1"){
			
		} else {
			res.render('addevents', {title: 'PACES Admin add event', pageTitle: 'Events'})
		}
	}
})

/**
 * Add events router
 */
router.post('/addevents',eventValidation, (req,res,next) => {
    let body = {}
    body.name = req.body.event_title
    body.description = req.body.event_description
    body['start-date'] = req.body['start-date']
    body['end-date'] = req.body['end-date']
    let newEvent = new Event(body);
    newEvent.save()
    	.then(item => {
        // Renders the page of the new event added
        res.send("Thanks")
    })
})

router.get('/events', async (req, res, next) => {
    // Read the database for stored events
    // Pick the 2 recently added events 
    // Display the selected on the screen
    
    // To the right of the page...
    // Read event activities from database
    // Select 5 of the events
    // Display the selected events on the page
  
    // Check for upcoming schedules from the database
    // Select and display 3 recent upcoming events
    let events;
    await Event.find({},{},{limit: 2}, (err,event) => {
    events = event;
    console.log(event);
    });


router.get('/events', (req,res) => {
	let user
	if(!req.session.user){
		res.render("login", {error: "You need to be logged in to view this resource"})
	} else {
		user = req.session.user
		if(user.role !== "1"){
			user.newDate = moment().format("DD, MMMM YYYY")
        	user.pageTitle = "Event" 
			res.render("events", user)
		} else {
			user.newDate = moment().format("DD, MMMM YYYY")
        	user.pageTitle = "Event" 
			res.render("adminEvents")
		}
	}
})
router.get('/adminevents', (req,res,next) => {
    res.render('adminEvents', {title: 'PACES Admin Events', pageTitle: 'Events'})
})

      
    res.render('events', {title: 'PACES events', pageTitle: 'Events',style: 'events.css'});
  });
  
module.exports = router; 