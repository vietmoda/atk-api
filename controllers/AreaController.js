const Area = require("../models/Area");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
let treenode = "";
//list
const getall = (req, res, next) => {
  let status = req.query.status;
  let querystring = status && status != -1 ? { status: status } : {};
  Area.find(querystring)
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
  Area.findById(req.query._id)
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

//not public api
const getareabyid = (areaid) => {  
  return new Promise((resolve, reject) => {
    Area.findById(areaid)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//by code
const getbycode = (req, res, next) => {
  Area.find({
    code: req.query.code,
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
  let actionname = "Vô hiệu hóa danh mục đơn vị hành chính";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt danh mục đơn vị hành chính";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa danh mục đơn vị hành chính";
    resultmessage = i18n.__("deleted_successfully");
  }

  Area.findByIdAndUpdate(req.body._id, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "areas",
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
  Area.findByIdAndRemove(req.body._id)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa đơn vị hành chính",
        process.env.DATABASE_NAME,
        "areas",
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
    code: body.code,
    name: body.name,
    orderby: body.orderby,
    status: body.status,
    createduser: audit.actionuser,
  };
  await Area.findByIdAndUpdate(body._id, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "id|name|code|orderby|status";
      let paramvalue = `${body._id}|${body.name}|${body.code}|${body.orderby}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin đơn vị hành chính",
        process.env.DATABASE_NAME,
        "areas",
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
    let area = new Area({
      code: body.code,
      name: body.name,
      parentid: body.parentid,
      parentname: "",
      fullpath: "",
      fullname: "",
      level: 1,
      orderby: body.orderby,
      status: body.status,
      createduser: audit.username,
    });
    //Truy vấn thông tin của cơ quan cấp trên nếu có
    let parentfullpath = "";
    if (body.parentid && body.parentid != "") {
      //Nếu là đơn vị con
      await Area.find({ _id: body.parentid })
        .then((result) => {
          area.parentname = result[0].name;
          area.fullname = `${body.name}, ${result[0].fullname}`;
          area.level = result[0].level + 1;
          parentfullpath = result[0].fullpath;
        })
        .catch((error) => {
          logger.error(error);
        });
    } else {
      //Nếu là đơn vị cha
      area.parentname = "";
      area.fullname = body.name;
      area.level = 1;
    }
    //Thực hiện thêm mới
    area
      .save()
      .then(async (result) => {
        //log command
        let paramname = "id|name|code|parentid|parentname|orderby|status";
        let paramvalue = `${body.id}|${body.name}|${body.code}|${body.parentid}|${body.parentid}|${body.orderby}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới đơn vị hành chính",
          process.env.DATABASE_NAME,
          "areas",
          paramname,
          paramvalue
        );
        //update fullpath
        const resultupdatepath = await updatefullpath(
          result._id,
          parentfullpath
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

const updatefullpath = async (id, parentfullpath) => {
  let fullpath = "";
  if (parentfullpath && parentfullpath != "") {
    fullpath = `${id},${parentfullpath}`;
  } else {
    fullpath = id;
  }
  const updateData = {
    fullpath: fullpath,
  };
  await Area.findByIdAndUpdate(id, { $set: updateData }, { new: true })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return {};
    });
};

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
      name: item.name,
      itemlevel: itemlevel,
      children: buildtrees(data, item._id, itemlevel + 1),
    }));
  }
};

const getprefixtrees = (level, prefix) => {
  let s = "";
  for (let i = 1; i < level; i++) {
    s = `${s}${prefix}`;
  }
  return s;
};

//lam phang du lieu cay
const flattdata = (data, flatted) => {
  data.forEach((e) => {
    flatted.push({
      _id: e._id,
      name: `${getprefixtrees(e.itemlevel, "-")}${e.name}`,
      //newscategoryname: e.newscategoryname
    });
    if (e.children && e.children.length > 0) {
      flattdata(e.children, flatted);
    }
  });
};

const gettrees = async (req, res, next) => {
  try {
    const data = await Area.find({
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

module.exports = {
  getall,
  getbyid,
  getbycode,
  updatestatus,
  remove,
  edit,
  add,
  getareabyid,
  gettrees,
};
