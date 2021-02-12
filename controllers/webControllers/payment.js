const Payment = require('../../model/payment');
const User = require('../../model/user')
const request = require('request')
const axios = require('axios');
const Group = require('../../model/group');
const groupController = require('../webControllers/group')
const courseController = require('../webControllers/course')
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

                if(paymentData.trx_ref.includes("course")){
                    paymentData.purpose = 'course'
                    console.log("group id--------------",receivedData.meta['group_id'])
                    const course = await courseController.getById(receivedData.meta['group_id'])
                    console.log("Returned group ====", course)
                    paymentData.narration = course.name

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
        // const nnn = await axios(options, async (error, response) => {
        //     console.log("Staerting")
        //     if (error) throw new Error(error);
        // if(response){
        //     receivedData = JSON.parse(response.body).data
        // console.log("Data inside dthe await ==", JSON.parse(response.body))


        // const user = await User.findOne({email:receivedData.customer.email}, async (err,user) => {
        //     if (err) console.log(err)
        //     return user
        // })

        // console.log("New session added ============ ", user)
        // var paymentData = {
        //     userId : user._id,
        //     trx_ref : receivedData['tx_ref'],
        //     payment_date : receivedData['created_at'],
        //     amount : receivedData['amount'],
        //     narration : 'Monthly',
        //     purpose: 'membership'
        // }
        // console.log("Payment data to be stored", paymentData)

        // const returnedData = await exports.createOne(paymentData)
        // const obj = [returnedData, user];
        // console.log("objectssssss ----", obj)
        // return obj
        // }
        
        // })

        // -----------------------------------------------------------------------
        // request(options, async function (error, response) { 
        //     if (error) throw new Error(error);
        
        // receivedData = JSON.parse(response.body).data
        // console.log("Data inside dthe await ==", JSON.parse(response.body))


        // const user = await User.findOne({email:receivedData.customer.email}, async (err,user) => {
        //     if (err) console.log(err)
        //     return user
        // })

        // console.log("New session added ============ ", user)
        // var paymentData = {
        //     userId : user._id,
        //     trx_ref : receivedData['tx_ref'],
        //     payment_date : receivedData['created_at'],
        //     amount : receivedData['amount'],
        //     narration : 'Monthly',
        //     purpose: 'membership'
        // }
        // console.log("Payment data to be stored", paymentData)

        // const returnedData = await exports.createOne(paymentData)
        // const obj = [returnedData, user];
        // return obj
        // });
    }
}

exports.getAll = async (data) => {
    var limit = parseInt(data.query) || 10;
    var page = parseInt(data.query) || 1;
    var options = {
        sort: { payment_date: 1 },
        populate: 'userId',
        // select:'firstname lastname',
        // lean: true,
        // offset: offset, 
        limit: limit,
        page: page,
        // pagination :true,
      };
    const payments = await Payment.paginate({}, options/*, select: "firstname lastname email phone address"*/)

    return payments;
}