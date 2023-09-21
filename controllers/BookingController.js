const Booking = require("../models/Booking");
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
  Booking.find(querystring)
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

//list by...
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
      visitername: { $regex: new RegExp(query.keyword, "i") },
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
  Booking.find(stringquery)
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
      visitername: { $regex: new RegExp(query.keyword, "i") },
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

  Booking.countDocuments(stringquery)
    .then((count) => {
      Booking.find(stringquery)
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
      visitername: { $regex: new RegExp(query.keyword, "i") },
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

  Booking.countDocuments(stringquery)
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
  Booking.findById(req.query._id)
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

    let booking = new Booking({
      visitername: body.visitername,
      address: body.address,
      telephone: body.telephone,
      email: body.email,
      totalmember: body.totalmember,
      leaderinfo: body.leaderinfo,
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
          "visitername|address|telephone|email|totalmember|leaderinfo|visitdate|visitdate";
        let paramvalue = `${body.visitername}|${body.address}|${body.telephone}||${body.email}|${body.totalmember}|${body.leaderinfo}|${body.visitdate}|${body.visitdate}`;
        LogCommand.add(
          audit,
          "ADD",
          "Đặt lịch dâng hương, tham quan di tích",
          process.env.DATABASE_NAME,
          "bookings",
          paramname,
          paramvalue
        );
        //Xử lý file nếu có
        if (body.image && body.image != "") {
          await FileController.updatesource(
            body.image,
            result._id,
            fixedsourcetype.newstitleimage
          );
        }
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
  let bookingid = req.body._id;
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
      visitdate = Util.todate(doby.visitdate);
    }
  } catch (error) {}

  let updateData = {
    visitername: body.visitername,
    address: body.address,
    telephone: body.telephone,
    email: body.email,
    totalmember: body.totalmember,
    leaderinfo: body.leaderinfo,
    visitdate: visitdate,
    visithour: body.visithour,
    content: body.content,
    processstatus: body.processstatus,
    processinfo: body.processinfo,
    status: body.status,
  };

  //update
  Booking.findByIdAndUpdate(bookingid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname =
        "visitername|address|telephone|email|totalmember|leaderinfo|visitdate|visitdate";
      let paramvalue = `${body.visitername}|${body.address}|${body.telephone}||${body.email}|${body.totalmember}|${body.leaderinfo}|${body.visitdate}|${body.visitdate}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Cập nhật thông tin đặt lịch dâng hương, tham quan di tích",
        process.env.DATABASE_NAME,
        "bookings",
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
  let bookingid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa dữ liệu đặt lịch";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt dữ liệu đặt lịch";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa dữ liệu đặt lịch";
    resultmessage = i18n.__("deleted_successfully");
  }

  Booking.findByIdAndUpdate(bookingid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "bookings",
        "bookingid|status",
        `${bookingid}|${req.body.status}`
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
  let bookingid = req.body._id;
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

  Booking.findByIdAndUpdate(bookingid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "PROCESS",
        "Cập nhật trạng thái xử lý thông tin đặt lịch",
        process.env.DATABASE_NAME,
        "bookings",
        "bookingid|processstatus|processinfo",
        `${bookingid}|${req.body.processstatus}|${req.body.processinfo}`
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
  let bookingid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Booking.findByIdAndRemove(bookingid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa thông tin đặt lịch",
        process.env.DATABASE_NAME,
        "bookings",
        "bookingid",
        bookingid
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
  getwithtotal,
  count,
  updatestatus,
  remove,
  updateprocess,
  add,
  edit,
};
