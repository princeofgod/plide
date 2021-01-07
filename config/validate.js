const {check,param , validationResult, Result, body} = require("express-validator")
const Group = require("../model/group")
const User = require("../model/user")
const Event = require("../model/event")
const Category = require("../model/category")
const bcrypt = require("bcryptjs")
const { NotExtended } = require("http-errors")
// const { param } = require("../routes")
let a;

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


const result = (req,res,next) => {
    const result = validationResult(req)

    if(!result.isEmpty()){
        const error = result()[0].msg 
        console.log(error)
    }
    next();
}

/**
 * Group validation
 * Validates the form that adds group
 */
const groupValidation =  [
    check("title").notEmpty().withMessage("Title is required").custom(async value => {
        await Group.findOne({title:value}).then(group => {
            if(group) throw new Error("Group with same name already exist");
        })
    }),
    check("description").notEmpty().withMessage("Description is required"),
]


/**
 * Event validation
 * Validates the form that adds events
 */
const eventValidation = [
    check("event_title").notEmpty().withMessage("Event title is required!").custom(async value => {
        await Event.findOne({name:value},(err, events => {
            if (events) {
                throw new Error("Event with same title already exists.");
            } else {
                
            }
        }))
    }),
    check("event_description").notEmpty().withMessage("Event description is required!"),
]

/**
 * Category validation
 * Validates the form that adds category
 */
const categoryValidation = [
    check("category_name").notEmpty().withMessage("Category name can't be left empty").custom(async value => {
        await Category.findOne({name:value})
            .then(category => {
                if(category){
                    throw new Error("Category with name already exists!");
                }
            })
    }),
    check("category_description").isEmpty().withMessage("Category description can't be left empty"),
]

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

const resetPasswordValidation = [
    check("password").notEmpty().withMessage("Enter password!").isLength({min: 6}).withMessage("Password must be up to 6 characters long.")
        .custom(async (value, {req}) => {
            if(value !== req.body.password2){
                throw new Error("Passwords do not match!")
            }
        }),
]

const tokenVerify = [
    param("random_character").notEmpty().custom(async (value) => {
        await User.findOne({remember_token:value})
            .then(user => {
                if(!user){
                    throw new Error("Invalid token")
                } else {
                    exports.a = user
                }
            })
    })
]

module.exports = {categoryValidation, registerValidation, loginValidation, groupValidation,eventValidation, resetPasswordValidation,forgotPasswordValidation,tokenVerify , result}