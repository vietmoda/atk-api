const Festival = require("../models/HistoricalSiteFestival");
const LogCommand = require("./LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const Util = require("../assistants/util");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  if (req.query.historicalsiteid && req.query.historicalsiteid != "") {
    querystring = {
      ...querystring,
      historicalsiteid: req.query.historicalsiteid,
    };
  }
  Festival.find(querystring)
    .then(async (result) => {
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
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
const getbyid = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  Festival.findById(req.query._id)
    .then(async (result) => {
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

//add new
const add = (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let festival = new Festival({
      name: body.name,
      description: body.description,      
      historicalsiteid: body.historicalsiteid,
      status: body.status,
    });

    festival
      .save()
      .then(async (result) => {
        //log command
        let paramname = "name|description|historicalsiteid|status";
        let paramvalue = `${body.name}|${body.description}|${body.historicalsiteid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới thông tin lễ hội gắn với di tích lịch sử",
          process.env.DATABASE_NAME,
          "historicalsiteupgrades",
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
  } catch (error) {
    logger.error(error);
    res.json({
      error: 1,
      message: error,
    });
  }
};

//Edit
const edit = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    name: body.name,
    description: body.description,      
    historicalsiteid: body.historicalsiteid,
    status: body.status,
  };
  Festival.findByIdAndUpdate(
    body._id,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //log command
      let paramname = "id|name|description|historicalsiteid|status";
        let paramvalue = `${body._id}|${body.name}|${body.description}|${body.historicalsiteid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin lễ hội gắn với di tích lịch sử",
        process.env.DATABASE_NAME,
        "historicalsiteupgrades",
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
  let actionname = "Vô hiệu hóa thông tin lễ hội gắn với di tích lịch sử";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt thông tin lễ hội gắn với di tích lịch sử";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa thông tin lễ hội gắn với di tích lịch sử";
    resultmessage = i18n.__("deleted_successfully");
  }

  Festival.findByIdAndUpdate(
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
        "historicalsiteupgrades",
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

//Remove
const remove = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Festival.findByIdAndRemove(req.body._id)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa thông tin lễ hội gắn với di tích lịch sử",
        process.env.DATABASE_NAME,
        "historicalsiteupgrades",
        "id",
        req.body._id
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("permanently_deleted_successfully"),
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

module.exports = {
  getall,
  getbyid,
  updatestatus,
  remove,
  edit,
  add,
};
