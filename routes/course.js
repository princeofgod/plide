const express = require('express');
const Course = require('../model/course');
const router = express.Router();
const courseController = require('../controllers/webControllers/course');
const { categoryValidation } = require('../config/validate');
const { validationResult } = require('express-validator');
const moment = require("moment");
const helper = require('../config/helpers');
let page = {
  newDate : moment().format("DD, MMMM YYYY"),
  title : 'PACES Categories',
pageTitle : 'Category'
}

/**
 * 
 */
router.post('/addCategory',categoryValidation, async (req,res) => {
	console.log("Category ------", req.body)
	
    const result = validationResult(req)
    if(!result.isEmpty()){
      	const error = result.array()[0].msg
      	res.render('add-category', { error:error })
    } else {
		if (req.body['needs-fund'] === "true") {
			req.body['need_funds'] = true
		} else {
			req.body['need_funds'] = false
		}
		let body = req.body;  
	
		await courseController.createOne(body)

		res.redirect('../course/categories')
		// res.render("./admin/add-category", {success: `New category ${body.name} has been created`})
    }
})

router.get('/categories', async (req,res,next) => {
	if(!req.session.user){
	  res.render('login')
	}else{
		if(req.session.user.role !== '1' ){
			// let error = 
			res.render('login', {error:"You do not have enough privilege to access the requested page"})
		} else {
			
			const categories = await courseController.getAll()
			console.log("fundable ====", categories)
			if(categories === undefined){
				res.redirect('./admin/admin-category',{page:page, user:req.session.user, categories: categories})
			}else {res.render('./admin/admin-category',{page:page, user:req.session.user, categories: categories})}
		}
	}
})

router.get('/add-category', (req,res) => {
	
    if(!req.session.user){
      res.render('login')
    }else{
      if(req.session.user.role !== '1' ){
      // let error = 
      res.render('login', {error:"You do not have enough privilege to access the requested page"})
      } else {
      res.render('./admin/add-category',{page:page, user:req.session.user})
      }
    }
})
  
router.get('/funding', async (req, res, next) => {
	if(!req.session.user) res.redirect('/users/login')
 	else {
		let user = req.session.user
		page.pageTitle = "Fund a course"
		page.title = 'PACES Fund a course'

		const courses = await courseController.getFundableCourses()
		console.log("ggggggg==", courses)
		if(user.role === '1'){
			res.render('./admin/adminfundACourse', {user:user, page:page,courses:courses})
		} else {
			res.render('./users/fundACourse', {user:user, page:page,courses:courses});
		}
	 }
});

/**
* Routing for the payment page
*/
router.get('/payment?:id', async (req,res) => {
	console.log(req.query)

    if(!req.session.user){
      	res.redirect('/users/login')
    }else{
		console.log("Here")
		let user = req.session.user
		page.pageTitle = "Dashboard"
		page.title = 'PACES Admin Events'
		const course = await courseController.getOne(req.query.id)
		if(course != undefined){
			course.date = moment(course["createdAt"]).format("D MMM, YYYY")
		}
		console.log("coursepppppppppppppp ",course)
		const paymentStat = await helper.paymentStat(course.name)
		res.render('payment', {user:user, page:page,course:course,donor:paymentStat.donor, recent:paymentStat.recent, paymentStat:paymentStat})
    }
})

router.get('/payment-form', async (req,res) => {
	console.log("hiiiiii")
    if(!req.session.user){
      	res.redirect('/users/login')
    }else{
		page.pageTitle = "Fund a course"
		page.title = 'PACES Fund a course'
        res.render('./users/payment-form', {page:page, user:req.session.user})
    }
})

router.post('/updateShare', (req, res) => {
	console.log("REq. body ", req.body)

	Course.updateOne({_id:req.body.id},{$inc : {shares : 1}},{new :true}, (err, course) => {
		if(err) {
			console.log(err)
		}
		if (course) {
			console.log("New value ========= ", course.shares)
			res.json({course:course})
		}
	})
})

router.get('/viewcourses', async (req,res) => {
	if(!req.session.user){
    	res.redirect('/users/login')
  	}else{
		const courses = await courseController.getAllPaginated(req);
		page.pageTitle = "Cause";
		page.title = "PACES Cause"
		console.log(courses)

		if(req.session.user.role === '1') {
			res.render('./admin/viewcourse', {course:courses, page:page, estimate: courses.page *courses.limit, pagination:{page:courses.page,}})
	
		}
		res.render('./users/viewcourse', {course:courses, page:page, estimate: courses.page *courses.limit, pagination:{page:courses.page,}})
	}

})
  module.exports = router; 