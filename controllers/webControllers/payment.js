const Payment = require('../../model/payment');
const User = require('../../model/user')
const request = require('request')
const axios = require('axios');
const Group = require('../../model/group');
const groupController = require('../webControllers/group')
const causeController = require('./cause')
// const paymentController = require('../webControllers')
exports.createOne = async (paymentData) => {
    const data = await Payment.create(paymentData);
    return data;
}

exports.verifyPayment = async (data) => {
    console.log("Entered here o")
    if(data.status == "successful") {
        var options = {
        'method': 'GET',
        'url': `https://api.flutterwave.com/v3/transactions/${data['transaction_id']}/verify`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer FLWSECK_TEST-879312b513e407c7d1a7ab757d84932f-X'
        }
        };
        console.log("inside here",options)
        
        const s = await axios(options).then(async response => {
            console.log("hereee");
            
            if(response){
                console.log(response.data);
                const receivedData = response.data.data
                const user = await User.findOne({email:receivedData.customer.email}, async (err,user) => {
                        if (err) console.log(err)
                        return user
                })
                console.log("New session added ============ ", user)
                console.log("received data from flutterwave", receivedData)

                var paymentData = {
                    userId : user._id,
                    trx_ref : receivedData['tx_ref'],
                    payment_date : receivedData['created_at'],
                    amount : receivedData['amount'],
                    transaction_id:receivedData['id'],
                    narration : '',
                    purpose: ''
                }
                console.log(" sdmnsbdmbvmsbdmvmsbdvmnsbdvm", paymentData)

                if(paymentData.trx_ref.includes("cause")){
                    paymentData.purpose = 'cause'
                    console.log("group id--------------",receivedData.meta['group_id'])
                    const cause = await causeController.getById(receivedData.meta['group_id'])
                    console.log("Returned group ====", cause)
                    paymentData.narration = cause.name

                } else if(paymentData.trx_ref.includes("subscribe")){
                    paymentData.purpose = 'membership'
                    paymentData.narration = 'Monthly subscription'
                }
                console.log("Payment data to be stored", paymentData)

                const returnedData = await exports.createOne(paymentData)
                const obj = [returnedData, user];
                console.log("objectssssss ----", obj)
                return obj
            }

        }).catch(error => {

        })

        return s
    }
}

exports.getAll = async (data) => {
    var limit = parseInt(data.query.limit) || 15;
    var page = parseInt(data.query.page) || 1;
    var options = {
        sort: { payment_date: 1 },
        populate: 'userId',
        limit: limit,
        page: page,
        pagination :true,
      };
    const payments = await Payment.paginate({}, options/*, select: "firstname lastname email phone address"*/)
    // console.log(payments);

     
    //   console.log(payments.docs[3])
    //   payments.forEach(element => {
    //       element.date = moment(payment_date).format("DD, MMMM YYYY");
    //   });
    return payments;
}