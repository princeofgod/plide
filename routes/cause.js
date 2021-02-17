const express = require('express');
const Cause = require('../model/cause');
const router = express.Router();
const causeController = require('../controllers/webControllers/cause');
const { categoryValidation } = require('../config/validate');
const { validationResult } = require('express-validator');
const moment = require("moment");
const helper = require('../config/helpers');
let page = {
  newDate : moment().format("DD, MMMM YYYY"),
  title : 'PACES Causes',
pageTitle : 'Cause'
}

/**
 * 
 */
router.post('/addCause',categoryValidation, async (req,res) => {
	console.log("Cause ------", req.body)
	
    const result = validationResult(req)
    if(!result.isEmpty()){
      	const error = result.array()[0].msg
      	res.render('add-cause', { error:error })
    } else {
		if (req.body['needs-fund'] === "true") {
			req.body['need_funds'] = true
		} else {
			req.body['need_funds'] = false
		}
		let body = req.body;  
	
		await causeController.createOne(body)

		res.redirect('../cause/causes')
		// res.render("./admin/add-cause", {success: `New cause ${body.name} has been created`})
    }
})

router.get('/causes', async (req,res,next) => {
	if(!req.session.user){
	  res.redirect('../users/login')
	}else{
		if(req.session.user.role !== '1' ){
			// let error = 
			res.render('login', {error:"You do not have enough privilege to access the requested page"})
		} else {
			
			const causes = await causeController.getAll()
			console.log("fundable ====", causes)
			if(causes === undefined){
				page.title = 'PACES Admin cause'
				res.redirect('./admin/admin-cause',{page:page, user:req.session.user, causes: causes})
			}else {
				page.title = 'PACES Admin Cause'
				res.render('./admin/admin-cause',{page:page, user:req.session.user, causes: causes})}
		}
	}
})

router.get('/add-cause', (req,res) => {
	
    if(!req.session.user){
      res.render('../users/login')
    }else{
      if(req.session.user.role !== '1' ){
      // let error = 
      res.render('login', {error:"You do not have enough privilege to access the requested page"})
      } else {
      res.render('./admin/add-cause',{page:page, user:req.session.user})
      }
    }
})
  
router.get('/funding', async (req, res, next) => {
	if(!req.session.user) res.redirect('../users/login')
 	else {
		let user = req.session.user
		page.pageTitle = "Fund a cause"
		page.title = 'PACES Fund a cause'

		const causes = await causeController.getFundableCourses()
		console.log("ggggggg==", causes)
		if(user.role === '1'){
			res.render('./admin/adminfundACourse', {user:user, page:page,causes:causes})
		} else {
			res.render('./users/fundACourse', {user:user, page:page,causes:causes});
		}
	 }
});

/**
* Routing for the payment page
*/
router.get('/payment?:id', async (req,res) => {
	console.log(req.query)

    if(!req.session.user){
      	res.redirect('../users/login')
    }else{
		console.log("Here")
		let user = req.session.user
		page.pageTitle = "Dashboard"
		page.title = 'PACES Admin Events'
		const cause = await causeController.getOne(req.query.id)
		if(cause != undefined){
			cause.date = moment(cause["createdAt"]).format("D MMM, YYYY")
		}
		console.log("coursepppppppppppppp ",cause)
		const paymentStat = await helper.paymentStat(cause.name)
		if(req.session.user === '1'){
			res.render('./admin/payment', {user:user, page:page,cause:cause,donor:paymentStat.donor, recent:paymentStat.recent, paymentStat:paymentStat})
		}else {
			res.render('./users/payment', {user:user, page:page,cause:cause,donor:paymentStat.donor, recent:paymentStat.recent, paymentStat:paymentStat})
		}
    }
})

router.get('/payment-form', async (req,res) => {
	console.log("hiiiiii")
    if(!req.session.user){
      	res.redirect('.../users/login')
    }else{
		page.pageTitle = "Fund a cause"
		page.title = 'PACES Fund a cause'
        res.render('./users/payment-form', {page:page, user:req.session.user})
    }
})

router.post('/updateShare', (req, res) => {
	console.log("REq. body ", req.body)

	Cause.updateOne({_id:req.body.id},{$inc : {shares : 1}},{new :true}, (err, cause) => {
		if(err) {
			console.log(err)
		}
		if (cause) {
			console.log("New value ========= ", cause.shares)
			res.json({cause:cause})
		}
	})
})

router.get('/viewcauses', async (req,res) => {
	if(!req.session.user){
    	res.redirect('../users/login')
  	}else{
		const causes = await causeController.getAllPaginated(req);
		page.pageTitle = "Cause";
		page.title = "PACES Cause"
		console.log(causes)

		if(req.session.user.role === '1') {
			res.render('./admin/viewcause', {cause:causes, page:page, estimate: causes.page *causes.limit, pagination:{page:causes.page,}})
	
		}
		res.render('./users/viewcause', {cause:causes,user:req.session.user, page:page, estimate: causes.page *causes.limit, pagination:{page:causes.page,}})
	}

})
  module.exports = router; 