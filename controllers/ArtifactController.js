const Artifact = require("../models/Artifact");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
//list
const getall = (req, res, next) => {
  let query = req.query;
  let statusquery =
    query && query.status && query.status != -1
      ? { status: query.status }
      : { status: { $ne: 2 } };
  let stringquery;
  if (query && query.historicalsiteid && query.historicalsiteid != -1) {
    //su dung toan tu spread (...)
    stringquery = {
      ...statusquery,
      historicalsiteid: query.historicalsiteid,
    };
  } else {
    stringquery = statusquery;
  }
  Artifact.find(stringquery)
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
  Artifact.findById(req.query._id)
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
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa dữ liệu hiện vật";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt dữ liệu hiện vật";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa dữ liệu hiện vật";
    resultmessage = i18n.__("deleted_successfully");
  }

  Artifact.findByIdAndUpdate(req.body._id, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "artifacts",
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
  Artifact.findByIdAndRemove(req.body._id)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa dữ liệu hiện vật",
        process.env.DATABASE_NAME,
        "artifacts",
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
  let updateData = {
    name: body.name,
    othername: body.othername,
    origin: body.origin,
    material: body.material,
    age: body.age,
    size: body.size,
    weight: body.weight,
    infomation: body.infomation,
    historicalsiteid: body.historicalsiteid,
    status: body.status,
    createduser: audit.actionuser,
  };
  await Artifact.findByIdAndUpdate(
    body._id,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //Log command
      let paramname =
        "id|name|othername|origin|material|age|size|weight|infomation|historicalsiteid|status";
      let paramvalue = `${body._id}|${body.name}|${body.othername}|${body.origin}|${body.material}|${body.age}|${body.size}|${body.weight}|${body.infomation}|${body.historicalsiteid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin hiện vật",
        process.env.DATABASE_NAME,
        "artifacts",
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

const add = async (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let artifact = new Artifact({
      name: body.name,
      othername: body.othername,
      origin: body.origin,
      material: body.material,
      age: body.age,
      size: body.size,
      weight: body.weight,
      infomation: body.infomation,
      historicalsiteid: body.historicalsiteid,
      status: body.status,
      createduser: audit.actionuser,
    });

    //Thực hiện thêm mới
    artifact
      .save()
      .then(async (result) => {
        //log command
        let paramname =
          "name|othername|origin|material|age|size|weight|infomation|historicalsiteid|status";
        let paramvalue = `${body.name}|${body.othername}|${body.origin}|${body.material}|${body.age}|${body.size}|${body.weight}|${body.infomation}|${body.historicalsiteid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới hiện vật",
          process.env.DATABASE_NAME,
          "artifacts",
          paramname,
          paramvalue
        );        
        //-----------
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: i18n.__("added_successfully"),
          data: resultupdatepath,
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
  updatestatus,
  remove,
  edit,
  add,  
};
