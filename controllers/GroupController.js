const Group = require("../models/Group");
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
  Group.find(querystring)
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
      res.json({
        error: 1,
        message: error,
      });
    });
};

//by ID
const getbyid = (req, res, next) => {
  Group.findById(req.query._id)
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
  let groupid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };

  let actionname = "Vô hiệu hóa nhóm quyền";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt nhóm quyền";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa nhóm quyền";
    resultmessage = i18n.__("deleted_successfully");
  }

  Group.findByIdAndUpdate(groupid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "groups",
        "groupid|status",
        `${groupid}|${req.body.status}`
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

//Remove a group
const remove = (req, res, next) => {
  let groupid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Group.findByIdAndRemove(groupid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa danh mục nhóm quyền thao tác",
        process.env.DATABASE_NAME,
        "groups",
        "groupid",
        groupid
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

//Edit group
const edit = (req, res, next) => {
  let groupid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    groupname: body.groupname,
    listroleid: body.listroleid,
    status: body.status,
  };
  Group.findByIdAndUpdate(groupid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "groupid|groupname|listroleid|status";
      let paramvalue = `${groupid}|${body.groupname}|${body.listroleid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin danh mục nhóm quyền thao tác",
        process.env.DATABASE_NAME,
        "groups",
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

//add role in the group
const editrole = (req, res, next) => {
  let groupid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    listroleid: body.listroleid,
  };
  Group.findByIdAndUpdate(groupid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "groupid|listroleid";
      let paramvalue = `${groupid}|${body.listroleid}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Cập nhật quyền trong nhóm",
        process.env.DATABASE_NAME,
        "groups",
        paramname,
        paramvalue
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("edited_successfully"),
        data: groupid,
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
    let group = new Group({
      groupname: body.groupname,
      listroleid: body.listroleid || "",
      status: body.status,
      createduser: audit.username,
    });
    group
      .save()
      .then(async (result) => {
        //log command
        let paramname = "groupname|listroleid|status";
        let paramvalue = `${body.groupname}|${body.listroleid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới danh mục nhóm quyền thao tác",
          process.env.DATABASE_NAME,
          "groups",
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

//check role in the group
const ingroup = async (roleid, groupid) => {
  try {
    Group.findById(groupid)
      .then((result) => {
        let listrole = result.listroleid;
        for (let i = 0; i < listrole.length; i++) {
          if (roleid == listrole[i]) {
            return 1;
          }
        }
      })
      .catch((error) => {
        logger.error(error);
        return -1;
      });
    return 0;
  } catch (error) {
    logger.error(error);
    return -1;
  }
};

module.exports = {
  getall,
  getbyid,
  updatestatus,
  remove,
  edit,
  editrole,
  ingroup,
  add,
};
