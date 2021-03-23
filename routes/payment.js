const express = require('express');
const router = express.Router();
const Payment = require('../model/payment');
const paymentController = require('../controllers/webControllers/payment');
const User = require("../model/user")
const moment = require('moment')
const page = {
    newDate : moment().format("DD, MMMM YYYY"),
    pageTitle : 'Fund a cause',
    title : 'Fund a cause'
}


router.get("/savePayment", async (req, res) => {
	const data = req.query;
    
    const returnedData = await paymentController.verifyPayment(req.query)

    // console.log("Returned data == ", returnedData)
    // const [user] = returnedData;
    // console.log("req.session.user before assigning user", req.session.user)
    req.session.user = returnedData[1]
    // console.log("req.session.user after assigning user", req.session.user)

    res.redirect('../users/home')
  
})

router.get('/getPayments', async (req, res) => {
    if(!req.session.user){
    	res.redirect('/users/login')
  	}else{
		if(req.session.user.role !== "1"){
			res.redirect('../users/home')
		} else {
			const payments = await paymentController.getAll(req)
            
            for(let i = 0; i < payments.docs.length; i++){
                payments.docs[i].date = moment(payments.docs[i]['payment_date']).format("DD, MMMM YYYY") ;
                console.log(payments.docs[i])
        
              }
			page.pageTitle = "Payment";
			page.title = "PACES Payments"
			res.render("./admin/viewpayment", {user:req.session.user, payment:payments, page:page,estimate: payments.page * payments.limit})
		}
	}
})

router.get('/success', (req, res) => {
	console.log("Url that redirected here----------", req.url)
	if(!req.session.user){
		res.redirect("../users/home")
	} else {
		console.log("REQUEST=================",req.rawHeaders[11].split("/")[req.rawHeaders[11].split("/").length-1])
		// if(req.session.redirecter == "/addgro")
		const success = "The donation has been made successfully."
		res.render("./admin/successful-payment", {user:req.session.user, page:page,success:success});
	}
})
module.exports = router;
