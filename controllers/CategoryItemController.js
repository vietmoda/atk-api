const CategoryItem = require("../models/CategoryItem");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();

//list
const getall = (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  CategoryItem.find(querystring)
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
  CategoryItem.findById(req.query._id)
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

//by cat id
const getbycategoryid = (req, res, next) => {  
  let query = req.query;
  let statusquery =
    query && query.status && query.status != -1
      ? { status: query.status }
      : { status: { $ne: 2 } };
  let querystring = {};
  if (query && query.categoryid && query.categoryid != "") {
    //su dung toan tu spread (...)
    querystring = {
      ...statusquery,
      categoryid: query.categoryid,
    };
  } else {
    querystring = statusquery;
  }
  
  CategoryItem.find(querystring)
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

//update status
const updatestatus = (req, res, next) => {
  let itemid = req.body._id;
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

  CategoryItem.findByIdAndUpdate(itemid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "items",
        "itemid|status",
        `${itemid}|${req.body.status}`
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
  let itemid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  CategoryItem.findByIdAndRemove(itemid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa danh mục dùng chung",
        process.env.DATABASE_NAME,
        "categoryitem",
        "itemid",
        itemid
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
  let itemid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    itemname: body.itemname,
    categoryid: body.categoryid,
    parentid: body.parentid,
    status: body.status,
  };
  CategoryItem.findByIdAndUpdate(itemid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "itemid|itemname|categoryid|status";
      let paramvalue = `${body.itemid}|${body.itemname}|${body.categoryid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin danh mục dùng chung",
        process.env.DATABASE_NAME,
        "categoryitems",
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
    let item = new CategoryItem({
      itemname: body.itemname,
      categoryid: body.categoryid,
      parentid: body.parentid,
      status: body.status,
      createduser: audit.username,
    });
    item
      .save()
      .then(async (result) => {
        //log command
        let paramname = "itemname|categoryid|status";
        let paramvalue = `${body.itemname}|${body.catecategoryidgorycode}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới danh mục dùng chung",
          process.env.DATABASE_NAME,
          "categoryitems",
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

module.exports = {
  getall,
  getbyid,
  getbycategoryid,
  updatestatus,
  remove,
  edit,
  add,
};
