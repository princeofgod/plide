const mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    gender: {
        type: String,
    },
    password: {
        type: String,
        require: true
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    local_govt: {
        type: String,
    },
    address:{
        type : String,
    },
    ward: {
        type: String,
    },
    employment_status: {
        type: String,
    },
    role: {
        type: String,
        require: true
    },
    isActive: {
        type: Boolean,
        require: true,
        default: false
    },
    confirmation_token: {
        type: String
    },
    remember_token: {
        type: String
    },
    profile_pic: {
        type: String
    },
    card_number: {
        type: String
    },
    permission: []
},{
    timestamps: { createdAt: true, updatedAt: false }
},{
    collation: { locale: 'en', strength: 2 }
})

userSchema.virtual('fullname').get(() => {
    return `${this.firstname} ${this.lastname}`
})
// encrypt the password using 'bcryptjs'
userSchema.pre('save', async function hashPassword(next) {
    try {
      const user = this;
  
      // only hash the password if it has been modified (or is new)
      if (!user.isModified('password')) return next();
  
      // generate a salt
      const salt = await bcrypt.genSalt(10);
  
      // hash the password along with our new salt
      const hash = await bcrypt.hash(user.password, salt);
  
      // override the cleartext password with the hashed one
      user.password = hash;
      return next();
    } catch (e) {
      return next(e);
    }
});
  
// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.methods.correctPassword = async function (typedPassword, originalPassword) {
    return await bcrypt.compare(typedPassword, originalPassword);
};

userSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', userSchema);
module.exports = User;