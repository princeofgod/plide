const express = require('express');
const Cause = require('../model/cause');
const router = express.Router();
const causeController = require('../controllers/webControllers/cause');
const userController = require('../controllers/webControllers/user')
const { categoryValidation } = require('../config/validate');
const { validationResult } = require('express-validator');
const moment = require("moment");
const helper = require('../config/helpers');
var multer  = require('multer');
const Payment = require('../model/payment');
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, __dirname + '/../images/cause')
	},
	filename: function (req, file, cb) {
	  cb(null, file.fieldname + '-' + Date.now() + "." +file.originalname.split(".")[1])
	}
  })

  var upload = multer({ storage:storage });

let page = {
  newDate : moment().format("DD, MMMM YYYY"),
  title : 'PACES Causes',
pageTitle : 'Cause'
}

/**
 * Route for saving causes
 */
router.post('/addCause', upload.single('image'), categoryValidation, async (req,res) => {	
    const result = validationResult(req)
    if(!result.isEmpty()){
		  const error = result.array()[0].msg
      	res.render('./admin/add-cause', { error:error })
    } else {

		if (req.body['needs-fund'] === "true") {
			req.body['need_funds'] = true
		} else {
			req.body['need_funds'] = false
		}
		email = req.body["organizer"].split(" ")[2].replace(")","").replace("(","")

		let body = req.body;  
		const organizer  = await userController.getOneByEmail(email)
		body.organizerId = organizer._id;
		body.image = req.file.filename;
		await causeController.createOne(body)

		page.title = 'PACES Causes',
		page.pageTitle = 'Cause'
		res.render("./admin/add-cause", {success: `New cause ${body.name} has been created`})
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
		const payment = await helper.recentCauses()

		const newPayment = []
		for(let x= 0;x<payment.length;x++){
			newPayment.push(payment[x][0])
		}
		
		const percent=[]
		for(let i=0;i<newPayment.length;i++){
			await Payment.findOne({narration:newPayment[i].name}, (err, result) => {
				if(err) console.log(err)
				if(result) {
					percent.push(result)
				}
			});
		}
		if(user.role === '1'){
			res.render('./admin/adminfundACause', {user:user, page:page,causes:causes,payment:newPayment})
		} else {
			res.render('./users/fundACause', {user:user, page:page,causes:causes, payment:newPayment});
		}
	 }
});

/**
* Routing for the payment page
*/
router.get('/payment?:id', async (req,res) => {
    if(!req.session.user){
      	res.redirect('../users/login')
    }else{
		let user = req.session.user
		page.pageTitle = "Dashboard"
		page.title = 'PACES Admin Events'
		const cause = await causeController.getOne(req.query.id)
		if(cause != undefined){
			cause.date = moment(cause["createdAt"]).format("D MMM, YYYY")
		}
		const paymentStat = await helper.paymentStat(cause.name)
		if(req.session.user.role === '1'){
			res.render('./admin/payment', {user:user, page:page,cause:cause,donor:paymentStat.donor, recent:paymentStat.recent, paymentStat:paymentStat})
		}else {
			res.render('./users/payment', {user:user, page:page,cause:cause,donor:paymentStat.donor, recent:paymentStat.recent, paymentStat:paymentStat})
		}
    }
})

router.get('/payment-form', async (req,res) => {
    if(!req.session.user){
      	res.redirect('.../users/login')
    }else{
		page.pageTitle = "Fund a cause"
		page.title = 'PACES Fund a cause'
        res.render('./users/payment-form', {page:page, user:req.session.user})
    }
})

router.post('/updateShare', (req, res) => {
	Cause.updateOne({_id:req.body.id},{$inc : {shares : 1}},{new :true}, (err, cause) => {
		if(err) {
			console.log(err)
		}
		if (cause) {
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

		if(req.session.user.role === '1') {
			res.render('./admin/viewcause', {cause:causes, page:page, estimate: causes.page *causes.limit, pagination:{page:causes.page,}})
		} else {
			res.render('./users/viewcause', {cause:causes,user:req.session.user, page:page, estimate: causes.page *causes.limit, pagination:{page:causes.page,}})
		}
	}
})

router.post('/delete', async (req, res) => {
	const del = await causeController.deleteOne(req.body['cause_name'])
	res.redirect('../cause/viewcauses')
})
  module.exports = router; 