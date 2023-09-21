const SystemConfig = require("../models/SystemConfig");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();

//list
const getall = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  SystemConfig.find(querystring)
    .then((result) => {
      res.send({
        error: 0,
        message: "",
        data: result,
        prefixcachekey: prefixcachekey,
        cache: false,
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

//by ID
const getbykey = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  SystemConfig.find({ configkey: req.query.configkey })
    .then((result) => {
      res.send({
        error: 0,
        message: "",
        data: result,
        prefixcachekey: prefixcachekey,
        cache: false,
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

//update status
const updatestatus = (req, res, next) => {
  let configid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };

  let actionname = "Vô hiệu hóa cấu hình";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt cấu hình";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa cấu hình";
    resultmessage = i18n.__("deleted_successfully");
  }

  SystemConfig.findByIdAndUpdate(configid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "systemconfigs",
        "configid|status",
        `${configid}|${req.body.status}`
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

//Remove a role
const remove = (req, res, next) => {
  let configid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  SystemConfig.findByIdAndRemove(configid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa cấu hình",
        process.env.DATABASE_NAME,
        "systemconfigs",
        "configid",
        configid
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("deleted_successfully"),
        result: result,
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

//Edit a role
const edit = (req, res, next) => {
  let configid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    configkey: body.configkey,
    configvalue: body.configvalue,
    status: body.status,
  };
  SystemConfig.findByIdAndUpdate(configid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "configid|configkey|configvalue|status";
      let paramvalue = `${configid}|${body.configkey}|${body.configvalue}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin cấu hình",
        process.env.DATABASE_NAME,
        "systemconfigs",
        paramname,
        paramvalue
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("edited_successfully"),
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

//add new role
const add = (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let systemcongfig = new SystemConfig({
      configkey: body.configkey,
      configvalue: body.configvalue,
      status: body.status,
      createduser: audit.username,
    });
    systemcongfig
      .save()
      .then(async (result) => {
        //log command
        let paramname = "configkey|configvalue|status";
        let paramvalue = `${body.configkey}|${body.configvalue}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới cấu hình",
          process.env.DATABASE_NAME,
          "systemconfigs",
          paramname,
          paramvalue
        );
        //-----------
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: i18n.__("added_successfully"),
          data: result._id,
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
  } catch (error) {
    logger.error(error);
    res.json({
      error: 1,
      message: error,
    });
  }
};

module.exports = {
  getall,
  getbykey,
  updatestatus,
  remove,
  edit,
  add,
};
