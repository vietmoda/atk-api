const Category = require("../models/Category");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();

//list
const getall = (req, res, next) => {
  let status = req.query.status;
  let querystring = status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  Category.find(querystring)
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

//by ID
const getbyid = (req, res, next) => {
  Category.findById(req.query._id)
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

//by code
/*
const getbycode = (req, res, next) => {
  Category.find({
    categorycode: req.query.categorycode,
  })
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

*/

//update status
const updatestatus = (req, res, next) => {
  let categoryid = req.body._id;
  let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
  };
  let updateData = {
      status: req.body.status,
  };
  let actionname = "Vô hiệu hóa loại danh mục dùng chung";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
      actionname = "Kích hoạt loại danh mục dùng chung";
      resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
      actionname = "Đánh dấu xóa loại danh mục dùng chung";
      resultmessage = i18n.__("deleted_successfully");
  }

  Category.findByIdAndUpdate(categoryid, { $set: updateData }, { new: true })
      .then(async (result) => {
          //Log command
          LogCommand.add(
              audit,
              "STATUS",
              actionname,
              process.env.DATABASE_NAME,
              "categories",
              "categoryid|status",
              `${categoryid}|${req.body.status}`
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
  let categoryid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Category.findByIdAndRemove(categoryid, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa loại danh mục dùng chung",
        process.env.DATABASE_NAME,
        "categories",
        "categoryid",
        categoryid
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

//Edit an User
const edit = (req, res, next) => {
  let categoryid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    categoryname: body.categoryname,
    categorycode: body.categorycode,
    status: body.status,
  };
  Category.findByIdAndUpdate(categoryid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "categoryid|categoryname|categorycode|status";
      let paramvalue = `${categoryid}|${body.categoryname}|${body.categorycode}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin loại danh mục dùng chung",
        process.env.DATABASE_NAME,
        "categories",
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

const add = (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let category = new Category({
      categoryname: body.categoryname,
      categorycode: body.categorycode,
      status: body.status,
      createduser: audit.username,
    });
    category
      .save()
      .then(async (result) => {
        //log command
        let paramname = "categoryname|categorycode|status";
        let paramvalue = `${body.categoryname}|${body.categorycode}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới loại danh mục dùng chung",
          process.env.DATABASE_NAME,
          "categories",
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
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

module.exports = {
  getall,
  getbyid,
  //getbycode,
  updatestatus,
  remove,
  edit,
  add,
};
