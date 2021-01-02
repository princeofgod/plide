const {check , validationResult, Result} = require("express-validator")
const Group = require("../model/group")
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const { NotExtended } = require("http-errors")


const registerValidation = [
    check('fullname').isEmpty().withMessage("Full name is required!"),
    check("email").normalizeEmail().exists().isEmail().custom(async value => {
        await User.findOne({email:value}).then(user => {
            if(user){
                console.log("E-mail already in use.")
            }
        })
    }),
    check('password').exists().isLength({min:6}).withMessage("Password should be more than 6 characters long").custom((value,{req}) => {
        if(value !== req.body.password2){
            console.log("Passwords do not match")
        }else {
            console.log("Password ")
        }
    }),
    check('phone').exists().isMobilePhone("any"),
];


const loginValidation = [
    check("email").isEmpty().withMessage("email is required").exists().isEmail().normalizeEmail().custom(async value => {
        await User.findOne({email:value})
            .then(user => {
            if(!user) {
                console.log("User does not exist")
            } else {
                console.log("User present")
                console.log("Moving on to password check...")
            }
        })
    }),
    check("password").exists().custom(async (value,{req}) => {
        await User.findOne({email:req.body.email})
            .then(async user => {
                await bcrypt.compare(value, user.password)
                    .then(res => {
                        if(res === false){
                            console.log("Passwords do not match")
                        } else {
                            console.log("Weldone! Passwords do match")
                        }
                    })
                // try{                 
                    // Return a message user not available or incorrect credentials                       
                    // bcrypt.compare(req.password, user.password,(err,res) => {
                    //     if(err){
                    //         console.log(err.message)
                    //     }
                    //     if(res === false){
                    //         // Return a message incorrect credentials
                    //     } else {
                    //         console.log("user from validate = ", user)
                    //         req.session.user = user
                    //         return user
                    //     }
                    // })
                    // console.log("User found")
        })
    })     
]


const result = (req,res,next) => {
    const result = validationResult(req)
    const hasErrors = !result.isEmpty();

    if(!result.isEmpty()){
        const error = result()[0].msg 
        console.log(error)
    }
    next();
}


const groupValidation =  [
    check("title", "Title is required").exists(),
    check("description", "Description is required").exists(),
    check("title").custom(value => {
        return Group.findOne({title:value}).then(group => {
            if(group) return Promise.reject("Group with same name already exist")
        })
    }),
]

module.exports = {registerValidation, loginValidation, groupValidation, result}