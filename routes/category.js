const express = require('express');
const Category = require('../model/category');
const router = express.Router();
const categoryController = require('../controllers/webControllers/category');
const { categoryValidation } = require('../config/validate');
const { validationResult } = require('express-validator');
const moment = require("moment")
let page = {
  newDate : moment().format("DD, MMMM YYYY"),
  title : 'PACES Categories',
pageTitle : 'Category'
}

/**
 * 
 */
router.post('/addCategory',categoryValidation, async (req,res) => {
    let body = req.body;  

    const result = validationResult(req)
    if(!result.isEmpty()){
      	const error = result.array()[0].msg
      	res.render('add-category', { error:error })
    } else {
		await categoryController.createOne(body)
    }
    // if(!body.name || !body.description || !body.need_fund){
    //   res.render('add-category',{alert: "Fill in the requirwed fields"})
    // } else{
      // A Check if name already exists
    // }
  })

  router.get('/categories', (req,res,next) => {
	if(!req.session.user){
	  res.render('login')
	}else{
	  if(req.session.user.role !== '1' ){
		// let error = 
		res.render('login', {error:"You do not have enough privilege to access the requested page"})
	  } else {
		res.render('./admin/admin-category',{page:page, user:req.session.user})
	  }
	}
  })
  
  
  module.exports = router; 