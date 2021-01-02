const express = require('express');
const Category = require('../model/category');
const router = express.Router();
const categoryController = require('../controllers/webControllers/category');


router.post('/addCategory', (req,res, next) => {
    let body = req.body;  
    if(!body.name || !body.description || !body.need_fund){
      res.render('add-category',{alert: "Fill in the requirwed fields"})
    } else{
      // A Check if name already exists
      Category.findOne({name:body.name}, (err, category)=> {
        if(category){
          res.render('add-category', {alert: `Category with name ${body.name} already exists!`})
        } else{
          // Save category
          body.name = req.body.category_name;
          console.log('4', body.name)
          body.description = req.body.category_description;
  
          let newCategory = new Category(body);
          newCategory.save()
            .then(item => {
          console.log(newCategory)
          res.render("add-category", {success: `New category ${body.name} created`})
      })
        }
      })
    }
      
      
  
      
  })
  
  module.exports = router; 