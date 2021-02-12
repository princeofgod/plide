const User = require('../model/user');
const Event = require('../model/event');
const Course = require('../model/course');
const Payment = require('../model/payment');
// const Event = require('../model/event');

exports.getStatistics = async () => {
    const total = {}
    
		await User.countDocuments({}, (err, count) => {
			total.registered = count
		})
		await Event.countDocuments({},(err,count)=> {
			total.events = count
		})
		let date = new Date()
		await User.find({createdAt:{$gt:new Date(date.getFullYear(), date.getMonth(), date.getDate())}}).countDocuments({}, (err, count) => {
			total.registeredToday = count
		})
		await Course.find({need_funds:true}).countDocuments({}, (err, count) => {
			total.fundedCourse = count
		})
		// Total registered this month
		let month = new Date()
		await User.find({createdAt:{$gt:new Date(month.getFullYear(),month.getMonth())}}).countDocuments({}, (err, count) => {
			total.registeredThisMonth = count
		})
		await Event.find({createdAt:{$gt:new Date(month.getFullYear(),month.getMonth())}}).countDocuments({}, (err, count) => {
			total.eventsThisMonth = count
		})
		await Payment.find({paymentMadeAt:{$gt:new Date(month.getFullYear(),month.getMonth())}}).countDocuments({}, (err, count) => {
			total.fundedThisMonth = count
		})
		
		
		total.percentageRegisteredCurrentMonth = Math.ceil((total.registeredThisMonth/total.registered) * 100)
        total.percentageFunded = isNaN((total.fundedThisMonth/total.fundedCourse) * 100) ? 0 : (total.fundedThisMonth/total.fundedCourse) * 100
		total.percentageEventCurrentMonth = (total.eventsThisMonth/total.events) * 100
		
        isNaN(total.percentageFunded) ? 0 : total.percentageFunded
        return total
}

exports.setScheduleTime = async (data) => {
    if(data["start_time"].split(":")[0] > 12){
		let hour = data["start_time"].split(":")[0] - 12
		
		data["start_time"] = `${hour}:${data["end_time"].split(":")[1]} PM`
	} else if(data["start_time"].split(":")[0] < 12) {
		data["start_time"] = `${data["start_time"]} AM`
	} else if(data["start_time"].split(":")[0] == 12) {
		data["start_time"] = `${data["start_time"]} PM`
	}

	if(data["end_time"].split(":")[0] > 12){
		let hour = data["end_time"].split(":")[0] - 12
		
		data["end_time"] = `${hour}:${data["end_time"].split(":")[1]} PM`
	} else if(data["end_time"].split(":")[0] < 12) {
		data["end_time"] = `${data["end_time"]} AM`
	} else if(data["end_time"].split(":")[0] == 12) {
		data["end_time"] = `${data["end_time"]} PM`
	}

    return data
}

exports.paymentStat = async (courseName) => {
	const paymentStat = { };

	await Payment.find({narration:courseName}).countDocuments().then(value => {
		paymentStat.donor = value;
	}).catch(err => console.log(err))

	await Payment.find({narration:courseName}).populate('userId').limit(3).sort("ascending").then(value => {
		paymentStat.recent = value
	}).catch(err => console.log(err))
	console.log("payments =====", paymentStat.recent)

	return paymentStat;
}