const Organization = require("../models/Organization");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
let treenode = ''
//list
const getall = (req, res, next) => {  
  let status = req.query.status;
  let querystring = status && status != -1 ? { status: status } : {};
  Organization.find(querystring)
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
  Organization.findById(req.query._id)
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
const getbycode = (req, res, next) => {  
  Organization.find({
    orgcode: req.query.orgcode,
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

//Destroy an User
const destroy = (req, res, next) => {
  let orgid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: 2,
  };
  Organization.findByIdAndUpdate(orgid, { $set: updateData }, {new:true})
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "DESTROY",
        "Vô hiệu hóa cơ quan",
        process.env.DATABASE_NAME,
        "organizations",
        "orgid",
        orgid
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("destroyed_successfully"),
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

//update status
const updatestatus = (req, res, next) => {
  let orgid = req.body._id;
  let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
  };
  let updateData = {
      status: req.body.status,
  };
  let actionname = "Vô hiệu hóa loại danh mục cơ quan";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
      actionname = "Kích hoạt loại danh mục cơ quan";
      resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
      actionname = "Đánh dấu xóa loại danh mục cơ quan";
      resultmessage = i18n.__("deleted_successfully");
  }

  Organization.findByIdAndUpdate(orgid, { $set: updateData }, { new: true })
      .then(async (result) => {
          //Log command
          LogCommand.add(
              audit,
              "STATUS",
              actionname,
              process.env.DATABASE_NAME,
              "organizations",
              "orgid|status",
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
  let orgid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Organization.findByIdAndRemove(orgid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa cơ quan",
        process.env.DATABASE_NAME,
        "organizations",
        "orgid",
        orgid
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
  let orgid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    orgname: body.orgname,
    orgcode: body.orgcode,
    parentid: body.parentid,
    orgtype: body.orgtype,
    orderby: body.orderby,
    status: body.status,
    createduser: audit.actionuser,
  };
  await Organization.findByIdAndUpdate(orgid, { $set: updateData }, {new:true})
    .then(async (result) => {
      //Log command
      let paramname = "orgid|orgname|orgcode|parentid|orgtype|orderby|status";
      let paramvalue = `${body.orgid}|${body.orgname}|${body.orgcode}|${body.parentid}|${body.orgtype}|${body.orderby}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin cơ quan",
        process.env.DATABASE_NAME,
        "categories",
        paramname,
        paramvalue
      );
      //Nếu có thay đổi cơ quan cấp trên
      if (body.parentid !== body.oldparentid) {
        let parentfullpath = "";
        let parentlevel = 0;
        if (result.parentid !== "0") {
          await Organization.find({ _id: body.parentid })
            .then((result) => {
              parentfullpath = result[0].fullpath;
              parentlevel = result[0].orglevel;
            })
            .catch((error) => {
              logger.error(error);
            });
        }
        await updatepath(orgid, body.parentid, parentlevel, parentfullpath);
      }
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("edited_successfully"),
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

const add = async (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let organization = new Organization({
      orgname: body.orgname,
      orgcode: body.orgcode,
      parentid: body.parentid,
      fullpath: "",
      orglevel: 1,
      orgtype: body.orgtype,
      orderby: body.orderby,
      status: body.status,
      createduser: audit.username,
    });
    //Truy vấn thông tin của cơ quan cấp trên nếu có
    if (body.parentid != "0") {
      await Organization.find({ _id: body.parentid })
        .then((result) => {
          if (result[0].fullpath !== "") {
            organization.fullpath = `${result[0].fullpath}${result[0]._id},`;
          } else {
            organization.fullpath = `${result[0].fullpath},${result[0]._id},`;
          }
          organization.orglevel = result[0].orglevel + 1;
        })
        .catch((error) => {
          logger.error(error);
        });
    }
    //Thực hiện thêm mới
    organization
      .save()
      .then(async (result) => {
        //log command
        let paramname = "orgid|orgname|orgcode|parentid|orgtype|orderby|status";
        let paramvalue = `${body.orgid}|${body.orgname}|${body.orgcode}|${body.parentid}|${body.orgtype}|${body.orderby}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới cơ quan",
          process.env.DATABASE_NAME,
          "organizations",
          paramname,
          paramvalue
        );
        //-----------
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: i18n.__("added_successfully"),
          data: result._id,
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

const updatepath = async (orgid, parentid, parentlevel, parentfullpath) => {
  try {
    //Update lại thông tin fullpath và level cho org
    let orglevel = parentlevel + 1;
    let orgfullpath =
      parentfullpath === ""
        ? parentid === "0"
          ? ""
          : `,${parentid},`
        : `${parentfullpath}${parentid === "0" ? "" : `${parentid},`}`;

    let updateData = {
      orglevel: orglevel,
      fullpath: orgfullpath,
    };

    await Organization.updateOne({ _id: orgid }, { $set: updateData })
      .then((result) => {
        //console.log(`Cập nhật thành công ${orgid}`)
      })
      .catch((error) => {
        logger.error(error);
        return 0;
      });

    //Duyệt các cơ quan con
    let suborg = await Organization.find({ parentid: orgid });
    for (let i = 0; i < suborg.length; i++) {
      await updatepath(suborg[i]._id.toString(), orgid, orglevel, orgfullpath);
    }
    return 1;
  } catch (error) {
    logger.error(error);
    return 0;
  }
};

module.exports = {
  getall,
  getbyid,
  getbycode,
  destroy,
  updatestatus,
  remove,
  edit,
  add,
};
