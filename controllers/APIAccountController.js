const APIAccount = require("../models/ApiAccount");
const LogCommand = require("./LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const bcrypt = require("bcryptjs");

//list
const getall = (req, res, next) => {
  let status = req.query.status;
  let querystring = status && status != -1 ? { status: status } : {};
  APIAccount.find(querystring)
    .then(async (result) => {
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: result,
        prefixcachekey: prefixcachekey,
      });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({
        error: 1,
        message: error,
      });
    });
};

//check account
const checkaccess = async (url, usn, pwd) => {
  const stringquery = {
    username: usn,
    password: pwd,
  };
  APIAccount.find(stringquery)
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        const indexof = url.indexOf(result[i].apiurl);
        if (indexof >= 0) {
          return 1;
        }
      }
    })
    .catch((error) => {
      return 0;
    });
};

//update status
const updatestatus = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa tài khoản kết nối API";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt tài khoản kết nối API";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa tài khoản kết nối API";
    resultmessage = i18n.__("deleted_successfully");
  }

  APIAccount.findByIdAndUpdate(
    req.body._id,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "apiaccounts",
        "id|status",
        `${req.body._id}|${req.body.status}`
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: resultmessage,
        data: result,
        prefixcachekey: prefixcachekey,
      });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({
        error: 1,
        message: error,
      });
    });
};

//Remove an User
const remove = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  APIAccount.findByIdAndRemove(req.body._id)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa tài khoản kết nối API",
        process.env.DATABASE_NAME,
        "apiaccounts",
        "id",
        req.body._id
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("deleted_successfully"),
        data: result._id,
        prefixcachekey: prefixcachekey,
      });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({
        error: 1,
        message: error,
      });
    });
};

//Edit an User
const edit = async (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;

  //Thực hiện thêm mới
  bcrypt.hash(req.body.password, 10, (err, hashedpass) => {
    if (err) {
      res.json({
        error: 3,
        message: err,
      });
    }
    let updateData = {
      apiurl: body.apiurl,
      username: body.username,
      password: hashedpass,
      status: body.status,
    };

    APIAccount.findByIdAndUpdate(body._id, { $set: updateData }, { new: true })
      .then(async (result) => {
        //Log command
        let paramname = "apiurl|username|password|status";
        let paramvalue = `${body.apiurl}|${body.username}|${body.password}|${body.status}`;
        LogCommand.add(
          audit,
          "EDIT",
          "Sửa thông tin tài khoản kết nối API",
          process.env.DATABASE_NAME,
          "apiaccounts",
          paramname,
          paramvalue
        );
        //-----------
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: i18n.__("edited_successfully"),
          data: result._id,
          prefixcachekey: prefixcachekey,
        });
      })
      .catch((error) => {
        logger.error(error);
        res.status(500).json({
          error: 1,
          message: error,
        });
      });
  });
};

const add = async (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    //Thực hiện thêm mới
    bcrypt.hash(req.body.password, 10, (err, hashedpass) => {
      if (err) {
        res.json({
          error: 3,
          message: err,
        });
      }
      let apiaccount = new APIAccount({
        apiurl: body.apiurl,
        username: body.username,
        password: hashedpass,
        status: body.status,
      });
      apiaccount
        .save()
        .then(async (result) => {
          //log command
          let paramname = "apiurl|username|password|status";
          let paramvalue = `${body.apiurl}|${body.username}|${body.password}|${body.status}`;
          LogCommand.add(
            audit,
            "ADD",
            "Thêm mới tài khoản kết nối API",
            process.env.DATABASE_NAME,
            "apiaccounts",
            paramname,
            paramvalue
          );
          //-----------
          const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
          res.send({
            error: 0,
            message: i18n.__("added_successfully"),
            data: result,
            prefixcachekey: prefixcachekey,
          });
        })
        .catch((error) => {
          logger.error(error);
          res.status(500).json({
            error: 2,
            message: error,
          });
        });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 2,
      message: error,
    });
  }
};

module.exports = {
  getall,
  updatestatus,
  remove,
  edit,
  add,
  checkaccess,
};
