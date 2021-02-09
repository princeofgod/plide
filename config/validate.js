const {check,param,query} = require("express-validator")
const Group = require("../model/group")
const User = require("../model/user")
const Event = require("../model/event")
const Course = require("../model/course")
const bcrypt = require("bcryptjs")
const { NotExtended } = require("http-errors")
// const { query } = require("express")


/**
 * Validation for the regitration form
 */
const registerValidation = [
    check('fullname').notEmpty().withMessage("Full name is required!"),
    check("email").normalizeEmail().notEmpty().withMessage("Email is required!").isEmail().withMessage("Enter a valid email!")
        .custom(async value => {
            await User.findOne({email:value}).then(user => {
                if(user){
                    throw new Error("E-mail already in use.")
                }
            })
        }),
    check('password').notEmpty().isLength({min:6}).withMessage("Password should be more than 6 characters long").custom(async (value,{req}) => {
        if(value !== req.body.password2){
            throw new Error("Passwords do not match")
        }
    }),
    check('phone').notEmpty().withMessage("Mobile number is required!").isMobilePhone("any"),
];

/**
 * Validation for the login form
 */
const loginValidation = [
    check("email").notEmpty().withMessage("email is required").exists().isEmail().normalizeEmail().custom(async value => {
        await User.findOne({email:value})
            .then(user => {
            if(!user) {
                throw new Error("User does not exist")
            } 
        })
    }).custom(async value => {
        await User.findOne({email:value})
            .then(user => {
                if(user.isActive === false){
                    throw new Error("User account is not verified! Go to your mail and click the link to verify account.")
                }
            })
    }),
    check("password").notEmpty().custom(async (value,{req}) => {
        await User.findOne({email:req.body.email})
            .then(async user => {
                await bcrypt.compare(value, user.password)
                    .then(res => {
                        if(res === false){
                            throw new Error("Incorrect password.")
                        }  
                    })
        })
    })     
]


// const result = (req,res,next) => {
//     const result = validationResult(req)

//     if(!result.isEmpty()){
//         const error = result()[0].msg 
//         console.log(error)
//     }
//     next();
// }

/**
 * Group validation
 * Validates the form that adds group
 */
const groupValidation =  [
    check("title").notEmpty().withMessage("All fields are required!").custom(async value => {
        await Group.findOne({name:value})
            .then(group => {
                if(group) throw new Error("Group with same name already exist");
            })
    }),
    check("description").notEmpty().withMessage("All fields are required!"),
    check("group_leader").notEmpty().withMessage("All fields are required!"),
    check("group_sec").notEmpty().withMessage("All fields are required!"),
]


/**
 * Event validation
 * Validates the form that adds events
 */
const eventValidation = [
    check("event_title").notEmpty().withMessage("Event title is required!").custom(async value => {
        await Event.findOne({name:value}, ((err, events) => {
            
            if (events) {
                throw new Error("Event with same title already exists.");
            } else {
                
            }
        }))
    }),
    check("event_description").notEmpty().withMessage("Event description is required!"),
    check("event_manager").notEmpty().withMessage("Event manager is required!")
]

/**
 * Category validation
 * Validates the form that adds category
 */
const categoryValidation = [
    check("category_name").notEmpty().withMessage("Category name can't be left empty").custom(async value => {
        await Course.findOne({name:value})
            .then(course => {
                if(course){
                    throw new Error("Category with name already exists!");
                }
            })
    }),
    check("category_description").notEmpty().withMessage("Category description can't be left empty"),
]

/**
 * Validation for forget password
 * Validates the email sent
 */
const forgotPasswordValidation = [
    check("email").notEmpty().custom(async (value) => {
        await User.findOne({email:value})
            .then(user => {
                if(!user){
                    throw new Error("User not registered!")
                }
            })
    })
]

/**
 * Validation for resetting password
 * Validates the password for to be updated in the user information
 */
const resetPasswordValidation = [
    check("password").notEmpty().withMessage("Enter password!").isLength({min: 6}).withMessage("Password must be up to 6 characters long.")
        .custom(async (value, {req}) => {
            if(value !== req.body.password2){
                throw new Error("Passwords do not match!")
            }
        }),
]

/**
 * Verifies the token used to access the change password page
 */

const tokenVerify = [
    param("random_character").notEmpty().custom(async (value) => {
        await User.findOne({remember_token:value})
            .then(user => {
                if(!user){
                    throw new Error("Invalid token")
                }
            })
    })
]

const confirmRegisterToken = [
    query('random_character').notEmpty().custom(async (value) => {
        await User.findOne({ confirmation_token:value })
            .then(user => {
                if(!user) throw new Error("Invalid confirmation token")
            })
    })
]
const fileValidator =[
    check("picture").custom((value,{req}) => {
        if(!req.file){
            throw new Error("Select a file!")
        } else {
            // Check for the file type
            const expectedFile = ['png', 'jpg', 'jpeg']
            const fileExtension = req.file.mimetype.split("/").pop()
            if(!expectedFile.includes(fileExtension)){
                throw new Error("Image file required")
            }
        }
    })
]

const userGroupValidator =[
    check("fullname").notEmpty().withMessage("All fields are required"),
    check("group_name").notEmpty().withMessage("All fields are required"),
]

const scheduleVerification = [
    check("group").notEmpty().withMessage("All fields are required!"),
    check("start_time").custom((value,{req}) => {
        console.log("I am here---")
        console.log(value)
        // let t = "08:30"; // hh:mm
        let start_ms = Number(value.split(':')[0]) * 60 * 60 * 1000 + Number(value.split(':')[1]) * 60 * 1000;
        
        let end_ms = Number(req.body["end_time"].split(':')[0]) * 60 * 60 * 1000 + Number(req.body["end_time"].split(':')[1]) * 60 * 1000;
        

        if(start_ms > end_ms ){
            throw new Error("Start time cannot be higher than end time.")
        } else if(start_ms == end_ms){
            throw new Error("Start time and end time cannot be the same.")
        }
    }),
    check("date").custom(value => {
        let date = new Date(),
        year = parseInt(date.getFullYear()),
        month = parseInt(date.getMonth()),
        day = parseInt(date.getDate()),   
        year2 = parseInt(value.split("-")[0]),
        month2 = parseInt(value.split("-")[1]),
        day2 = parseInt(value.split("-")[2])

        if(year2 < year || month2 < month || day2 < day){
            throw new Error("Chosen date is past.")
        }
    })
]
module.exports = {userGroupValidator,fileValidator, confirmRegisterToken, categoryValidation,
     registerValidation, loginValidation, groupValidation,eventValidation, resetPasswordValidation,
     forgotPasswordValidation,tokenVerify, scheduleVerification}