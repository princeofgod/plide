const express = require('express');
const Group = require('../model/group');
const router = express.Router();
const groupController = require('../controllers/webControllers/group')

// Router for group
router.get('/group', (req,res,next) => {

    if(!req.session.user){
      res.render('login')
    }else{
      // Check for privileges and render specific pages
      if(req.session.user.role === '1'){
        res.render('admingroup', {title: 'PACES Admin', pageTitle: 'Groups'})
      } else {
        res.render('usergroups', {title: 'PACES User', pageTitle: 'Groups'})
      }
    }
  })


  // Saving the groups
router.post('/addgroup', (req,res,next) => {
    console.log("2", req.body)
    let body = req.body;
    body.name = req.body.title;
    let newGroup = new Group(body);
    newGroup.save()
    .then(item => {
        // Renders the page of the new added
      res.send("Group saved")
    })
  })

  module.exports = router;