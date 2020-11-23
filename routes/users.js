const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/webControllers/controllers');

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
    body.role = 3
    body.permission = 'user'
    req.body = body
  const registerMember = await controller.signup(req.body);

  if(registerMember){
    req.session.userID = registerMember._id
  }
  res.redirect('/register', registerMember, req.session);
});


// router.post('/confirm_account', async (req, res, next) => {
//   console.log("query", req.body.confirmation_token)
//   const confirm = await controller.confirm_account(req.body.confirmation_token);
//   const userRole = confirm.role;
//     console.log("1")
//   let link = ''
//   if(userRole === 1){
//     link = 'adminDashboard'
//     console.log("2")
//   }else {
//     link = 'userDashboard'
//   };
//   res.render(link, confirm)
// });

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

module.exports = router;
