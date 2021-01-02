const express = require('express');
const router = express.Router();

const Event = require('../model/event');

// const eventController = require('../controllers/webControllers/event');


router.post('/addevents', (req,res,next) => {
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
    console.log(("9900", req))
    let events;
    await Event.find({},{},{limit: 2}, (err,event) => {
    events = event;
    console.log(event);
    });
  
router.get('/adminevents', (req,res,next) => {
        res.render('adminEvents', {title: 'PACES Admin Events', pageTitle: 'Events'})
      })
router.get('/addevents', (req,res,next) => {
        res.render('addevents', {title: 'PACES Admin add event', pageTitle: 'Events'})
      })
      
    res.render('events', {title: 'PACES events', pageTitle: 'Events',style: 'events.css'});
  });
  
module.exports = router; 