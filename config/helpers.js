const User = require('../model/user');
const Event = require('../model/event');
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

		// Total registered this month
		let month = new Date()
		await User.find({createdAt:{$gt:new Date(month.getFullYear(),month.getMonth())}}).countDocuments({}, (err, count) => {
			total.registeredThisMonth = count
		})
		await Event.find({createdAt:{$gt:new Date(month.getFullYear(),month.getMonth())}}).countDocuments({}, (err, count) => {
			total.eventsThisMonth = count
		})
	
		total.percentageRegisteredCurrentMonth = (total.registeredThisMonth/total.registered) * 100
        total.percentageFunded = (total.fundedThisMonth/total.funded) * 100
        total.percentageEventCurrentMonth = (total.eventsThisMonth/total.events) * 100
        
        return total
}

exports.setScheduleTime = async (data) => {
    if(data["start_time"].split(":")[0] > 12){
		let hour = data["start_time"].split(":")[0] - 12
		console.log("hour------------", hour)
		data["start_time"] = `${hour}:${data["end_time"].split(":")[1]} PM`
	} else if(data["start_time"].split(":")[0] < 12) {
		data["start_time"] = `${data["start_time"]} AM`
	} else if(data["start_time"].split(":")[0] == 12) {
		data["start_time"] = `${data["start_time"]} PM`
	}

	if(data["end_time"].split(":")[0] > 12){
		let hour = data["end_time"].split(":")[0] - 12
		console.log("hour------------", hour)
		data["end_time"] = `${hour}:${data["end_time"].split(":")[1]} PM`
	} else if(data["end_time"].split(":")[0] < 12) {
		data["end_time"] = `${data["end_time"]} AM`
	} else if(data["end_time"].split(":")[0] == 12) {
		data["end_time"] = `${data["end_time"]} PM`
	}

    return data
}