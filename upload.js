const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/upload`)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cd) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cd(null, true)
    }
    else{
        cd(null, false)
    }
}

const limits = {
    fileSize: 1024 * 1024 * 5 
}

   

module.exports = multer({storage})
