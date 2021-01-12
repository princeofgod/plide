const express = require('express');
const { eventValidation } = require('../config/validate');
const router = express.Router();
const moment = require("moment")
const eventController = require('../controllers/webControllers/event')
const Event = require('../model/event');
const User = require('../model/user');
const { validationResult } = require('express-validator');

let page = {
    newDate : moment().format("DD, MMMM YYYY")
}
// const eventController = require('../controllers/webControllers/event');

/**
 * Get the add events page
 * Only available to the admin
 */
router.get('/addevents', (req,res,next) => {
	if(!req.session.user){
		res.redirect('../users/login')
	} else {
		if(req.session.user.role !== "1"){
			res.redirect('../users/home')
		} else {
			res.render('./admin/addevents', {title: 'PACES Admin add event', pageTitle: 'Events'})
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
        res.render('addevents', {error:error})
    } else {
        await eventController.createOne(req.body)
        res.render('addevents', {success : `Group has been created.`})                
    }
})


router.get('/events', (req,res) => {
	if(!req.session.user){
		res.redirect("../users/login")
	} else {
        let user = req.session.user
        page.pageTitle = 'Event'
        page.title = 'PACES Admin Events'

		if(user.role !== "1"){
			res.render("./users/events", {user:user, page:page})
		} else {
			res.render("./admin/adminEvents",{user :user,page:page})
		}
	}
})

      
router.post('/updateEvent', (req,res) => {
    Event.findOne({})
})
  
module.exports = router; 