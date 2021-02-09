const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate-v2');
const Mongoose = mongoose.Schema.Types
const paymentSchema = new mongoose.Schema({
    userId: {
        type: Mongoose.ObjectId,
        ref: 'User'
    },
    trx_ref : {
        type :String,
    },
    pay_ref :{
        type: String,
    },
    payment_date : {
        type: String,
    },
    amount : {
        type :String,
    },
    narration : {
        type :String,
    },
    purpose:{
        type: String,
        enum: ['course', 'membership'],
    }
})

paymentSchema.plugin(mongoosePaginate)
const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment