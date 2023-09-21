const NewsCategory = require("../models/NewsCategory");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();

//list
const getall = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  let query = req.query;
  let statusquery =
    query && query.status && query.status != -1
      ? { status: query.status }
      : { status: { $ne: 2 } };
  let querystring = {};
  if (query && query.type && query.type != "") {
    //su dung toan tu spread (...)
    querystring = {
      ...statusquery,
      newscategorytype: query.type,
    };
  } else {
    querystring = statusquery;
  }

  NewsCategory.find(querystring)
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

const getprefixtrees = (level, prefix) => {
  let s = "";
  for (let i = 1; i < level; i++) {
    s = `${s}${prefix}`;
  }
  return s;
};
//tree
const gettrees = async (req, res, next) => {
  try {
    const data = await NewsCategory.find({
      newscategorytype: req.query.type,
      status: 1,
    });
    const parentid =
      req.query.parentid && req.query.parentid != "" ? req.query.parentid : "";
    const trees = buildtrees(data, parentid, 1);
    let result;
    if (req.query.flatt && req.query.flatt == 1) {
      //convert to flat
      let flatted = [];
      flattdata(trees, flatted);
      result = flatted;
    } else {
      result = trees;
    }
    const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
    res.send({
      error: 0,
      message: "",
      data: result,
      prefixcachekey: prefixcachekey,
      cache: false,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

//get trees
const buildtrees = (data, parentid, itemlevel) => {
  //Lấy va duyet tất cả node theo id cha
  const childrens =
    parentid && parentid != ""
      ? data.filter((item) => item.parentid == parentid)
      : data.filter((item) => item.parentid == "" || !item.parentid);  
  if (childrens.length === 0) {
    return [];
  } else {    
    return childrens.map((item) => ({
      _id: item._id,
      newscategoryname: item.newscategoryname,
      itemlevel: itemlevel,
      children: buildtrees(data, item._id, itemlevel + 1),
    }));
  }
};

//lam phang du lieu cay
const flattdata = (data, flatted) => {
  data.forEach((e) => {
    flatted.push({
      _id: e._id,
      newscategoryname: `${getprefixtrees(e.itemlevel, "-")}${
        e.newscategoryname
      }`,
      //newscategoryname: e.newscategoryname
    });
    if (e.children && e.children.length > 0) {
      flattdata(e.children, flatted);
    }
  });
};

//by ID
const getbyid = async (req, res, next) => {
  const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
  NewsCategory.findById(req.query._id)
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
    let newscategories = new NewsCategory({
      newscategoryname: body.newscategoryname,
      newscategorytype: body.newscategorytype,
      parentid: body.parentid,
      status: body.status,
      createduser: audit.username,
    });
    newscategories
      .save()
      .then(async (result) => {
        //log command
        let paramname = "newscategoryname|newscategorytype|parentid|status";
        let paramvalue = `${body.newscategoryname}|${body.newscategorytype}|${body.parentid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới chuyên mục",
          process.env.DATABASE_NAME,
          "newscategories",
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

//Edit a role
const edit = (req, res, next) => {
  let newscategoryid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    newscategoryname: body.newscategoryname,
    newscategorytype: body.newscategorytype,
    parentid: body.parentid,
    status: body.status,
  };
  NewsCategory.findByIdAndUpdate(
    newscategoryid,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //Log command
      let paramname =
        "newscategoryid|newscategoryname|newscategorytype|parentid|status";
      let paramvalue = `${newscategoryid}|${body.newscategoryname}|${body.newscategorytype}|${body.parentid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin chuyên mục",
        process.env.DATABASE_NAME,
        "newscategories",
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
  let newscategoryid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa chuyên mục";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt chuyên mục";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa chuyên mục";
    resultmessage = i18n.__("deleted_successfully");
  }

  NewsCategory.findByIdAndUpdate(
    newscategoryid,
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
        "newscategories",
        "newscategoryid|status",
        `${newscategoryid}|${req.body.status}`
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
  let newscategoryid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  NewsCategory.findByIdAndRemove(newscategoryid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa chuyên mục",
        process.env.DATABASE_NAME,
        "newscategories",
        "newscategoryid",
        newscategoryid
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
  gettrees,
};
