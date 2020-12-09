const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/webControllers/controllers');
const Category = require('../public/javascripts/category');
const Group = require('../public/javascripts/group');

router.post('/login', async (req, res, next) => {
  const {email, password, role} = req.body;
  
  const loginUser = await controller.login({email, password, role});
  if(loginUser.role === 1){
    res.redirect('/adminDashboard', {title: 'PLACES Admin', style: 'adminDashboard.css'});
  }else {
    res.redirect('/userDashboard', {title: 'PLACES User', style: 'userDashboard.css'})
  }  
});

router.post('/registerMember', async (req, res, next) => {  
  let body = req.body;
    body.role = 2
    body.permission = 'user'
    body.firstname = body["fullname"].split(" ")[0];
    body.lastname = body["fullname"].split(" ")[1];
    req.body = body
  const registerMember = await controller.signup(req.body);

  if(registerMember){
    req.session.userID = registerMember._id
  }
  // console.log("1",req.body)

  res.redirect('/register', registerMember, req.session);
});


router.post('/confirm_account', async (req, res, next) => {
  console.log("query", req.body.confirmation_token)
  const confirm = await controller.confirm_account(req.body.confirmation_token);
  const userRole = confirm.role;
    console.log("1")
  let link = ''
  if(userRole === 1){
    link = 'adminDashboard'
    console.log("2")
  }else {
    link = 'userDashboard'
  };
  res.render(link, confirm)
});

router.post('/forgotPassword', async (req, res, next) => {
  let body = req.body;
  body.role = 3;
  req.body = body;
  await controller.forgot_password(body);
  res.redirect('/login');
});

// router.get('/viewEvents', function(req, res, next) {
//   // functions;
// });

// router.get('/viewEvents', function(req, res, next) {
//   // functions;
// });

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

router.post('/addevents', (req,res,next) => {
    let body = req.body;
    body.name = req.body.title
    let newEvent = new Event(body);
    newEvent.save()
    .then(item => {
        // Renders the page of the new event added
        res.render("")
    })
})
router.post('/add-candidates', (req,res, next) => {
    let body = req.body;
    body.name = req.body.candidate_name;
    body.description = req.body.candidate_description;

})
router.post('/addCategory', (req,res, next) => {
    let body = req.body;
    body.name = req.body.category_name;
    console.log('4', body.name)
    body.description = req.body.category_description;

    let newCategory = new Category(body);
    newCategory.save()
    .then(item => {
        console.log(newCategory)
        res.render("add-category")
    })
})

module.exports = router;