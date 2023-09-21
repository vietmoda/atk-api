const OrderMenu = require("../models/OrderMenu");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixedprocessstatus = require("../fixeddata/processstatus.json");
const FileController = require("../controllers/FileController");
const Util = require("../assistants/util");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  OrderMenu.find(querystring)
    .sort({ processstatus: 1 })
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

//list
const getpaging = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let statusquery =
    query && query.status && query.status != -1 && query.status != ""
      ? { status: query.status }
      : { status: { $ne: 2 } };
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...statusquery,
      fullname: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = statusquery;
  }
  //kiem tra trang thai xu ly
  let stringquery = {};
  if (
    query &&
    query.processstatus &&
    query.processstatus != -1 &&
    query.processstatus != ""
  ) {
    //su dung toan tu spread (...)
    stringquery = {
      ...searchquery,
      processstatus: query.processstatus,
    };
  } else {
    stringquery = searchquery;
  }
  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;
  OrderMenu.find(stringquery)
    .sort({ processstatus: 1 })
    .skip(startindex)
    .limit(itemperpage)
    .exec()
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

//pagination with total
const getwithtotal = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let statusquery =
    query && query.status && query.status != -1 && query.status != ""
      ? { status: query.status }
      : { status: { $ne: 2 } };
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...statusquery,
      fullname: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = statusquery;
  }
  //kiem tra trang thai xu ly
  let stringquery = {};
  if (
    query &&
    query.processstatus &&
    query.processstatus != -1 &&
    query.processstatus != ""
  ) {
    //su dung toan tu spread (...)
    stringquery = {
      ...searchquery,
      processstatus: query.processstatus,
    };
  } else {
    stringquery = searchquery;
  }
  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;

  OrderMenu.countDocuments(stringquery)
    .then((count) => {
      OrderMenu.find(stringquery)
        .sort({ processstatus: 1 })
        .skip(startindex)
        .limit(itemperpage)
        .exec()
        .then(async (result) => {
          const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
          res.send({
            error: 0,
            message: "",
            data: result,
            total: count,
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
    })
    .catch((counterror) => {
      logger.error(counterror);
      res.status(500).json({
        error: 1,
        message: counterror,
      });
    });
};

const count = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let statusquery =
    query && query.status && query.status != -1 && query.status != ""
      ? { status: query.status }
      : { status: { $ne: 2 } };
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...statusquery,
      fullname: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = statusquery;
  }
  //kiem tra trang thai xu ly
  let stringquery = {};
  if (
    query &&
    query.processstatus &&
    query.processstatus != -1 &&
    query.processstatus != ""
  ) {
    //su dung toan tu spread (...)
    stringquery = {
      ...searchquery,
      processstatus: query.processstatus,
    };
  } else {
    stringquery = searchquery;
  }

  OrderMenu.countDocuments(stringquery)
    .then(async (count) => {
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: count,
        prefixcachekey: prefixcachekey,
        cache: false,
      });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({
        error: 2,
        message: error,
      });
    });
};

//by ID
const getbyid = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  OrderMenu.findById(req.query._id)
    .then(async (result) => {
      const miximage = await mixfile(result, "array");
      res.send({
        error: 0,
        message: "",
        data: miximage,
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
    let visitdate;
    try {
      if (body.visitdate && body.visitdate != "") {
        visitdate = Util.todate(doby.visitdate);
      }
    } catch (error) {}

    let booking = new OrderMenu({
      fullname: body.fullname,
      address: body.address,
      telephone: body.telephone,
      email: body.email,
      totaldiners: body.totaldiners,
      visitdate: visitdate,
      visithour: body.visithour,
      content: body.content,
      processstatus: 0,
      processinfo: "",
      status: body.status,
      createduser: audit.username,
    });

    //save
    booking
      .save()
      .then(async (result) => {
        //log command
        let paramname =
          "fullname|address|telephone|email|totaldiners|visitdate|visitdate|content";
        let paramvalue = `${body.fullname}|${body.address}|${body.telephone}||${body.email}|${body.totaldiners}|${body.visitdate}|${body.visitdate}|${body.content}`;
        LogCommand.add(
          audit,
          "ADD",
          "Đặt bàn ăn",
          process.env.DATABASE_NAME,
          "ordermenus",
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
  let ordermenuid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let visitdate;
  try {
    if (body.visitdate && body.visitdate != "") {
      visitdate = Util.todate(body.visitdate);
    }
  } catch (error) {}

  let updateData = {
    fullname: body.fullname,
    address: body.address,
    telephone: body.telephone,
    email: body.email,
    totaldiners: body.totaldiners,
    visitdate: visitdate,
    visithour: body.visithour,
    content: body.content,
    status: body.status,
  };

  //update
  OrderMenu.findByIdAndUpdate(ordermenuid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname =
        "fullname|address|telephone|email|totaldiners|visitdate|visitdate|content";
      let paramvalue = `${body.fullname}|${body.address}|${body.telephone}||${body.email}|${body.totaldiners}|${body.visitdate}|${body.visitdate}|${body.content}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Cập nhật thông tin đặt bàn",
        process.env.DATABASE_NAME,
        "ordermenus",
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
  let ordermenuid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa dữ liệu đặt bàn";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt dữ liệu đặt bàn";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa dữ liệu đặt bàn";
    resultmessage = i18n.__("deleted_successfully");
  }

  OrderMenu.findByIdAndUpdate(ordermenuid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "ordermenus",
        "ordermenuid|status",
        `${ordermenuid}|${req.body.status}`
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

//update process
const updateprocess = (req, res, next) => {
  let ordermenuid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    processstatus: req.body.processstatus,
    processinfo: req.body.processinfo,
  };

  OrderMenu.findByIdAndUpdate(ordermenuid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "PROCESS",
        "Cập nhật trạng thái xử lý thông tin đặt bàn",
        process.env.DATABASE_NAME,
        "ordermenus",
        "ordermenuid|processstatus|processinfo",
        `${ordermenuid}|${req.body.processstatus}|${req.body.processinfo}`
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("processing_successful"),
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
  let ordermenuid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  OrderMenu.findByIdAndRemove(ordermenuid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa thông tin đặt bàn",
        process.env.DATABASE_NAME,
        "ordermenus",
        "ordermenuid",
        ordermenuid
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
  getpaging,
  updatestatus,
  remove,
  updateprocess,
  add,
  edit,
  count,
  getwithtotal
};
