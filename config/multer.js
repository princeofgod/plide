const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/avatar')
      },
      filename: function (req, file, cb) {
        cb(null, req.session.user._id + file.originalname)
      }
    })
     
const upload = exports = multer({ storage: storage })

