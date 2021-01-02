const  fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const User = require('../model/user');

/* exports.hashPassword = async (password) => {

    const saltRounds = await bcrypt.genSalt(10);
  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
  
    return hashedPassword
} */

exports.hashPassword = async (password) => {
  // generate a salt
  const salt = await bcrypt.genSalt(10);
  // hash the password along with our new salt
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

exports.comparePassword = async () => {
  bcrypt.compare()
}

exports.generateToken = async () => {  
  const token = uuid();
  
  const model = await User.find({confirmation_token: token});
  if(model) {
    this.generateToken();
  }

  return token;

}


// function to encode file data to base64 encoded string
exports.base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(path.resolve("./"+file));

    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

exports.generateRandomCharacter = (length) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.generateRandomPassword = () => {
    const password = generateRandomCharacter(6);

    return hashPassword(password);
}