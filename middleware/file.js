const path = require("path");
const multer = require("multer");
const fs = require("fs");
//const i18n = require("../config/i18n");
const allowminetype = require("../config/config.minetype")

var storage = multer.diskStorage({
  //multer create folder if not exist
  destination: function (req, file, cb) {
    const today = new Date();
    const uploadDirectory = `public/uploads/${today.getFullYear()}/`;
    fs.mkdirSync(uploadDirectory, { recursive: true });
    return cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (allowminetype.includes(file.mimetype)    ) {
      callback(null, true);
    } else {
      //Không thể response ngay ở middleware nên ko thể sử dụng res.json
      console.log(`Hệ thống không cho phép tải lên tệp ${file.mimetype}`);
      //callback với error khác null sẽ response nội dung error dưới dạng html. Ngược lại sẽ pass qua middleware. => Server sẽ bị crashed      
      callback(null, false);
    }
  },
  limits: {
    //50mb
    fileSize: 1024 * 1024 * 50,
  },
});


module.exports = {  
  upload,
};
