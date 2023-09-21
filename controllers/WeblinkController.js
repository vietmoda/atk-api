const Weblink = require("../models/Weblink");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixeddataweblinkimage = require("../fixeddata/sourcetype.json");
const FileController = require("../controllers/FileController");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  Weblink.find(querystring)
    .then(async (result) => {
      const miximage = await mixfile(result, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
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

//list by cat
const getbycategory = async (req, res, next) => {
  let query = req.query;
  let statusquery =
    query && query.status && query.status != -1
      ? { status: query.status }
      : { status: { $ne: 2 } };
  let stringquery = {};
  if (query && query.categoryid && query.categoryid != -1) {
    //su dung toan tu spread (...)
    stringquery = {
      ...statusquery,
      categoryid: query.categoryid,
    };
  } else {
    stringquery = statusquery;
  }
  Weblink.find(stringquery)
    .then(async (result) => {
      const miximage = await mixfile(result, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
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

//by ID
const getbyid = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  Weblink.findById(req.query._id)
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
    let weblink = new Weblink({
      linkname: body.linkname,
      linkurl: body.linkurl,
      viewtype: body.viewtype,
      categoryid: body.categoryid,
      status: body.status,
      createduser: audit.username,
    });
    weblink
      .save()
      .then(async (result) => {
        //log command
        let paramname = "linkname|linkurl|viewtype|categoryid|status";
        let paramvalue = `${body.linkname}|${body.linkurl}|${body.viewtype}||${body.categoryid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới liên kết website",
          process.env.DATABASE_NAME,
          "weblinks",
          paramname,
          paramvalue
        );
        //Xử lý file nếu có
        if (body.fileid && body.fileid != "") {
          await FileController.updatesource(
            body.fileid,
            result._id,
            fixeddataweblinkimage.weblinkimage
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
  let weblinkid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    linkname: body.linkname,
    linkurl: body.linkurl,
    viewtype: body.viewtype,
    categoryid: body.categoryid,
    status: body.status,
    createduser: audit.username,
  };
  Weblink.findByIdAndUpdate(weblinkid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "weblinkid|linkname|linkurl|viewtype|categoryid|status";
        let paramvalue = `${weblinkid}|${body.linkname}|${body.linkurl}|${body.viewtype}||${body.categoryid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin liên kết website",
        process.env.DATABASE_NAME,
        "weblinks",
        paramname,
        paramvalue
      );
      //Xử lý filevideo nếu có
      if (body.fileid != body.fileidolder) {
        if (body.fileid && body.fileid != "") {
          await FileController.updatesource(
            body.fileid,
            result._id,
            fixeddataweblinkimage.weblinkimage,
            audit
          );
          //Xóa avatar cũ đi
          if (
            body.fileidolder &&
            body.fileidolder != "" &&
            body.fileidolder != undefined
          )
            try {
              await FileController.deletefile(body.fileidolder, audit);
            } catch (error) {
              logger.error(error);
            }
        }
      }      
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
  let weblinkid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa liên kết website";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt liên kết website";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa liên kết website";
    resultmessage = i18n.__("deleted_successfully");
  }

  Weblink.findByIdAndUpdate(weblinkid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "weblinks",
        "weblinkid|status",
        `${weblinkid}|${req.body.status}`
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
  let weblinkid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Weblink.findByIdAndRemove(weblinkid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa liên kết website",
        process.env.DATABASE_NAME,
        "weblinks",
        "weblinkid",
        weblinkid
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

//Hàm này dùng nội bộ không export: Lấy thêm thông tin avatar của video
const mixfile = async (weblinks, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        weblinks.map((item) => {
          return FileController.getfilebysource(
            item._doc._id.toString(),
            fixeddataweblinkimage.weblinkimage
          )
            .then((result) => {
              return {
                ...item._doc,
                image: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {};
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return FileController.getfilebysource(
        weblinks._doc._id.toString(),
        fixeddataweblinkimage.weblinkimage
      )
        .then((result) => {
          return {
            ...weblinks._doc,
            image: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {};
        });
    }
  } catch (error) {
    logger.error(error);
    return {};
  }
};

module.exports = {
  getall,
  getbyid,
  getbycategory,
  updatestatus,
  remove,
  edit,
  add,
};
