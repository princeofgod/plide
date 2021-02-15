const express = require('express');
const router = express.Router();
const Payment = require('../model/payment');
const axios = require('axios');
const request = require('request');
const prettier = require('prettier');
const paymentController = require('../controllers/webControllers/payment');
const User = require("../model/user")
const page = {

}
const superagent = require('superagent')
const fetch = require('node-fetch');
const { Console } = require('console');

router.get("/savePayment", async (req, res) => {
    console.log("Get the request url",req.url)
	const data = req.query;
    console.log("I am here!!")
    console.log("shskdjhkj",req.query)
    
    const returnedData = await paymentController.verifyPayment(req.query)

    console.log("Returned data == ", returnedData)
    // const [user] = returnedData;
    console.log("req.session.user before assigning user", req.session.user)
    req.session.user = returnedData[1]
    console.log("req.session.user after assigning user", req.session.user)

    res.redirect('../users/home')
    // superagent
    //     .post('http://127.0.0.1:3002/payment/savePayments')
    //     .send(data) // sends a JSON post body
    //     .set('accept', 'json')
    //     .end((err, res) => {
    //         // Calling the end function will send the request
    //     });


// 	const request = await axios.post('http://127.0.0.1:3002/payment/savePayments', data).then(response => {
//         console.log("newwwwwww==")
// }).catch( err => {
//     console.log(err)
// })
})

router.get('/getPayments', async (req, res) => {
    if(!req.session.user){
    	res.redirect('/users/login')
  	}else{
		if(req.session.user.role !== "1"){
			res.redirect('../users/home')
		} else {
			const payments = await paymentController.getAll(req)

			page.pageTitle = "Payments";
			page.title = "PACES Payments"
			console.log(payments)
			res.render("./admin/viewpayment", {user:req.session.user, payment:payments, page:page,estimate: payments.page * payments.limit})
		}
	}
})

// router.post("/savePayments", async (req,res) => {
//     console.log("REq.body in the post route ===", req.body)
//     console.log("requested =====",req.body)
    
//     const returnedData = await paymentController.verifyPayment(req.body)

// 	// if(req.body.status == "successful") {
//     //     var options = {
//     //     'method': 'GET',
//     //     'url': `https://api.flutterwave.com/v3/transactions/${req.body['transaction_id']}/verify`,
//     //     'headers': {
//     //         'Content-Type': 'application/json',
//     //         'Authorization': 'Bearer FLWSECK_TEST-879312b513e407c7d1a7ab757d84932f-X'
//     //     }
//     //     };
//     //     console.log("inside here")
//     //     var data
         
//     //     await request(options, async function (error, response) { 
//     //     if (error) throw new Error(error);
        
//     //     data = JSON.parse(response.body).data
//     //     console.log("Data inside dthe await ==", JSON.parse(response.body).data)


//     //     req.session.user = await User.findOne({email:data.customer.email}, async (err,user) => {
//     //         if (err) console.log(err)
//     //         return user
//     //     })

//     //     console.log("New session added ============ ", req.session.user)
//     //     var paymentData = {
//     //         userId : req.session.user._id,
//     //         trx_ref : data['tx_ref'],
//     //         payment_date : data['created_at'],
//     //         amount : data['amount'],
//     //         narration : 'Monthly',
//     //         purpose: 'membership'
//     //     }
//     //     console.log("Payment data to be stored", paymentData)

//     //     const returnedData = await paymentController.createOne(paymentData)

//     //     console.log("Returned data after save!!! === ", returnedData)
//     //     if(!returnedData) {
//     //         console.log("unable to save data!!!")
//     //     } else {
//     //         console.log("Data saved successfully!!!")
//     //     }
//     //     });
//     // }
//     console.log("Returned data == ", returnedData)
//     const [user] = returnedData;
//     console.log("req.session.user before assigning user", req.session.user)
//     req.session.user = user
//     console.log("req.session.user after assigning user", req.session.user)

//     res.render('successful-payment', {user:req.session.user})
//     // res.render('./users/successful-payment', {user:req.session.user, page: page, })
//     // console.log("done")
//     // if(returnedData === undefined) {
//     //     return "unable to save data!!!"
        
//     // } else {
//     //     return "Data saved successfully!!!"
//     // }
// 	// // console.log("Thanks for paying ==")
// })


module.exports = router;
