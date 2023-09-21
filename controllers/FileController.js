const File = require("../models/File");
const fs = require("fs");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();

//upload file
const add = async (req, res, next) => {
  let body = req.body;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  var listid = "";
  let fileresult = [];
  var countuploaded = 0;
  try {
    for (const f of req.files) {
      let file = new File({
        fileurl: f.path,
        fileextension: f.mimetype,
        originalname: f.originalname,
        sourcetype: body.sourcetype,
        sourcekey: body.sourcekey,
        filesize: f.size,
        createduser: audit.useraction,
      });
      await file
        .save()
        .then((result) => {
          countuploaded = countuploaded + 1;
          listid = listid + "|" + result._id;
          fileresult.push(result);
        })
        .catch((error) => {
          logger.error(error);
          res.json({
            error: 1,
            message: `Tải tệp ${f.path} lỗi: ${error}`,
          });
        });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 4,
      message: error,
    });
  } finally {
    if (countuploaded > 0) {
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.json({
        error: 0,
        message: `Tải thành công ${countuploaded} tệp tin!`,
        id: listid.substring(1),
        data: fileresult,
        prefixcachekey: prefixcachekey,
      });
    } else {
      res.json({
        error: 0,
        message: `Không có tệp tin nào được tải lên`,
        id: "",
      });
    }
  }
};

const getbyid = (req, res, next) => {
  let fileid = req.query._id;
  try {
    File.findById(fileid)
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const getbysource = (req, res, next) => {
  let sourcetype = req.query.sourcetype;
  let sourcekey = req.query.sourcekey;
  try {
    let querystr = {
      sourcetype: sourcetype,
      sourcekey: sourcekey,
    };
    File.find(querystr)
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
          erro: 1,
          message: error,
        });
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      erro: 1,
      message: error,
    });
  }
};

//delete file (không xuất API)
const deletefile = async (fileid, audit) => {
  File.findByIdAndRemove(fileid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "DELETE",
        "Xóa file",
        process.env.DATABASE_NAME,
        "files",
        "fileid",
        fileid
      );
      //Delete file on server
      let filepath = result.fileurl.replace("/\\", "/");
      fs.unlink(filepath, (error) => {
        if (error) {
          logger.error(error);
        }
      });
      return 1;
    })
    .catch((error) => {
      logger.error(error);
      return 0;
    });
};

//remove file
const remove = async (req, res, next) => {
  let body = req.body;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  File.findByIdAndRemove(body._id)
    .then(async (result) => {
      //Log command
      let paramname = "id|fileurl";
      let paramvalue = `${result._id}|${result.fileurl}`;
      LogCommand.add(
        audit,
        "DELETE",
        "Xóa file",
        process.env.DATABASE_NAME,
        "files",
        paramname,
        paramvalue
      );

      //Delete file on server
      let filepath = result.fileurl.replace("/\\", "/");
      fs.unlink(filepath, (error) => {
        if (error) {
          logger.error(error);
          res.status(500).json({
            error: 2,
            message: `Remove file Error: ${error}`,
          });
        }
      });
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: `Xóa thành công file ${result._id}`,
        data: result,
        prefixcachekey: prefixcachekey,
      });
    })
    .catch((error) => {
      logger.error(error);
      res.status(500).json({
        error: 1,
        message: `Remove file Error: ${error}`,
      });
    });
};

//remove multible file
const removemulti = async (req, res, next) => {
  try {
    let listfileid = req.body.listfileid;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    var deletedcount = 0;
    for (let i = 0; i < listfileid.length; i++) {
      console.log(listfileid[i]);
      await File.findByIdAndRemove(listfileid[i])
        .then((result) => {
          if (result) {
            deletedcount = deletedcount + 1;
            //Log command
            let paramname = "id";
            let paramvalue = `${result._id}`;
            LogCommand.add(
              audit,
              "DELETE",
              "Xóa file",
              process.env.DATABASE_NAME,
              "files",
              paramname,
              paramvalue
            );
            //Delete file on server
            let filepath = result.fileurl.replace("/\\", "/");
            fs.unlink(filepath, (error) => {
              if (error) {
                logger.error(error);
                res.status(500).json({
                  error: 2,
                  message: `Remove file Error: ${error}`,
                });
              }
            });
          }
        })
        .catch((error) => {
          logger.error(error);
          res.status(500).json({
            error: 1,
            message: `Remove file Error: ${error}`,
          });
        });
    }
    const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
    res.send({
      error: 0,
      message: `Xóa thành công ${deletedcount} file`,
      data: "",
      prefixcachekey: prefixcachekey,
    });
  } catch (error) {
    res.status(500).json({
      error: 1,
      message: `Remove file Error: ${error}`,
    });
  }
};

const updatesource = async (fileid, sourcekey, sourcetype, audit) => {
  try {
    const updatedata = {
      sourcekey: sourcekey,
      sourcetype: sourcetype,
    };
    await File.findByIdAndUpdate(fileid, { $set: updatedata })
      .then((result) => {
        //Log command
        LogCommand.add(
          audit,
          "EDIT",
          "Sửa thông tin file",
          process.env.DATABASE_NAME,
          "files",
          "fileid|sourcekey|sourcetype",
          `${fileid}|${sourcekey}|${sourcetype}`
        );
        return 1;
      })
      .catch((error) => {
        logger.error(error);
        return 0;
      });
  } catch (error) {
    logger.error(error);
    return 0;
  }
};

//not public api
const getfilebysource = (sourcekey, sourcetype) => {
  return new Promise((resolve, reject) => {
    let querystr = {
      sourcetype: sourcetype,
      sourcekey: sourcekey,
    };
    File.find(querystr)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  add,
  remove,
  getbyid,
  getbysource,
  updatesource,
  deletefile,
  getfilebysource,
  removemulti,
};
