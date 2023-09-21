const Album = require("../models/Album");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixeddatasourcetype = require("../fixeddata/sourcetype.json");
const FileController = require("../controllers/FileController");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  Album.find(querystring)
    .then(async (result) => {
      let mixresultfile = await mixfile(result, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: mixresultfile,
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
  Album.find(stringquery)
    .then(async (result) => {
      let mixresultfile = await mixfile(result, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: mixresultfile,
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
  Album.findById(req.query._id)
    .then(async (result) => {
      let mixresultfile = await mixfile(result, "object");
      res.send({
        error: 0,
        message: "",
        data: mixresultfile,
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
    let image = new Album({
      imagename: body.imagename,
      description: body.description,
      categoryid: body.categoryid,
      status: body.status,
      createduser: audit.username,
    });
    image
      .save()
      .then(async (result) => {
        //log command
        let paramname = "imagename|description|categoryid|status";
        let paramvalue = `${body.imagename}|${body.description}|${body.categoryid}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới ảnh vào album",
          process.env.DATABASE_NAME,
          "albums",
          paramname,
          paramvalue
        );

        //Xử lý file nếu có
        if (body.fileid && body.fileid != "") {
          await FileController.updatesource(
            body.fileid,
            result._id,
            fixeddatasourcetype.albumimage
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

//add nhieu image trong 1 lan thao tac
const addmulti = async (req, res, next) => {
  try {
    let body = req.body;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    if (body.images && body.images.length > 0) {
      let images = body.images;
      let results = [];
      for (let i = 0; i < images.length; i++) {
        let image = new Album({
          imagename: images[i].imagename,
          description: images[i].description,
          categoryid: body.categoryid,
          status: 1,
          createduser: audit.username,
        });
        image
          .save()
          .then(async (result) => {
            //success                    
            //log command
            let paramname = "categoryid|imagename|description|status";
            let paramvalue = `${body.categoryid}|${images[i].imagename}|${images[i].description}|1`;
            LogCommand.add(
              audit,
              "ADD",
              "Thêm mới nhiều ảnh vào album",
              process.env.DATABASE_NAME,
              "albums",
              paramname,
              paramvalue
            );
            //Xử lý file nếu có
            if (images[i].fileid && images[i].fileid != "") {
              await FileController.updatesource(
                images[i].fileid,
                result._id,
                fixeddatasourcetype.albumimage
              );
            }
            //console.log(result)            
          })
          .catch((error) => {
            logger.error(error);
          });          
          //console.log(results)
      }    
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);        
      res.send({
        error: 0,
        message: i18n.__("added_successfully"),
        data: results,
        prefixcachekey: prefixcachekey,
      });
    } else {
      //Khong co image nao duoc them moi
      res.json({
        error: 0,
        message: i18n.__("nodata_executed"),
        data: result,        
      });
    }
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
  let imageid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    imagename: body.imagename,
    description: body.description,
    categoryid: body.categoryid,
    status: body.status,
  };
  Album.findByIdAndUpdate(imageid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "imageid|imagename|description|categoryid|status";
      let paramvalue = `${imageid}|${body.videoname}|${body.description}|${body.categoryid}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin ảnh trong album",
        process.env.DATABASE_NAME,
        "albums",
        paramname,
        paramvalue
      );
      //Xử lý filevideo nếu có
      if (body.fileid != body.fileidolder) {
        if (body.fileid && body.fileid != "") {
          await FileController.updatesource(
            body.fileid,
            result._id,
            fixeddatasourcetype.albumimage,
            audit
          );
          //Xóa file cũ đi
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
  let imageid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa ảnh trong album";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt ảnh trong album";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa ảnh trong album";
    resultmessage = i18n.__("deleted_successfully");
  }

  Album.findByIdAndUpdate(imageid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "albums",
        "imageid|status",
        `${imageid}|${req.body.status}`
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
  let imageid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  Album.findByIdAndRemove(imageid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa ảnh trong album",
        process.env.DATABASE_NAME,
        "albums",
        "imageid",
        imageid
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
const mixfile = async (images, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        images.map((image) => {
          return FileController.getfilebysource(
            image._doc._id.toString(),
            fixeddatasourcetype.albumimage
          )
            .then((result) => {
              return {
                ...image._doc,
                imagefile: result,
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
        images._id.toString(),
        fixeddatasourcetype.albumimage
      )
        .then((result) => {
          return {
            ...images,
            imagefile: result,
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
  addmulti,
};
