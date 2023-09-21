const HistoricalSite = require("../models/HistoricalSites");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const AreaController = require("../controllers/AreaController");
const fixedsourcetype = require("../fixeddata/sourcetype.json");
const FileController = require("../controllers/FileController");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  HistoricalSite.find(querystring)
    .then(async (result) => {
      const mixarearesult = await mixarea(result, "array");
      const mixavatarresult = await mixavatar(mixarearesult, "array");
      const mixaudioresult = await mixaudiofile(mixavatarresult, "array");
      const mixscanresult = await mixscanfile(mixaudioresult, "array");
      const miximageresult = await miximages(mixscanresult, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: miximageresult,
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
  Album.findById(req.query._id)
    .then(async (result) => {
      const mixarearesult = await mixarea(result, "object");
      const mixavatarresult = await mixavatar(mixarearesult, "object");
      const mixaudioresult = await mixaudiofile(mixavatarresult, "object");
      const mixscanresult = await mixscanfile(mixaudioresult, "object");
      const miximageresult = await miximages(mixscanresult, "object");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: miximageresult,
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

    let historicalsite = new HistoricalSite({
      name: body.name,
      introduce: body.introduce,
      areaid: body.areaid,
      areadetail: body.areadetail,
      latlong: body.latlong,
      greatpeople: body.greatpeople,
      vrlink: body.vrlink,
      status: body.status,
    });
    historicalsite
      .save()
      .then(async (result) => {
        //log command
        let paramname =
          "name|introduce|areaid|areadetail|latlong|greatpeople|vrlink|status";
        let paramvalue = `${result.name}|${body.introduce}|${body.areaid}|${body.areadetail}|${body.latlong}|${body.greatpeople}|${body.vrlink}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới điểm di tích lịch sử",
          process.env.DATABASE_NAME,
          "historicalsites",
          paramname,
          paramvalue
        );

        //avatar
        try {
          if (body.avatar && body.avatar != "") {
            await FileController.updatesource(
              body.avatar,
              result._id,
              fixedsourcetype.historicalsiteavatar
            );
          }
        } catch (error) {
          logger.error(error);
        }

        //file âm thanh
        try {
          if (body.audiofiles && body.audiofiles.length > 0) {
            for (let i = 0; i < body.audiofiles.length; i++) {
              await FileController.updatesource(
                body.audiofiles[i],
                result._id,
                fixedsourcetype.historicalsiteaudio
              );
            }
          }
        } catch (error) {
          logger.error(error);
        }
        //file scan
        try {
          if (body.scanfiles && body.scanfiles.length > 0) {
            for (let i = 0; i < body.scanfiles.length; i++) {
              await FileController.updatesource(
                body.scanfiles[i],
                result._id,
                fixedsourcetype.historicalsitescanfile
              );
            }
          }
        } catch (error) {
          logger.error(error);
        }
        //file images
        try {
          if (body.images && body.images.length > 0) {
            for (let i = 0; i < body.images.length; i++) {
              await FileController.updatesource(
                body.images[i],
                result._id,
                fixedsourcetype.historicalsiteimage
              );
            }
          }
        } catch (error) {
          logger.error(error);
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
/*
Đôi với các trường audiofiles, scanfiles, imagesfiles, 
+ Bỏ file nào thì X xóa file đó trên giao diện và gọi hàm delete file. 
+ Thêm file nào thì upload và đẩy lên toàn bộ list file id
*/
const edit = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    name: body.name,
    introduce: body.introduce,
    areaid: body.areaid,
    areadetail: body.areadetail,
    latlong: body.latlong,
    greatpeople: body.greatpeople,
    vrlink: body.vrlink,
    status: body.status,
  };
  HistoricalSite.findByIdAndUpdate(
    body._id,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //Log command
      let paramname =
        "id|name|introduce|areaid|areadetail|latlong|greatpeople|vrlink|status";
      let paramvalue = `${body._id}|${body.introduce}|${body.areaid}|${body.areadetail}|${body.latlong}|${body.greatpeople}|${body.vrlink}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin điểm di tích lịch sử",
        process.env.DATABASE_NAME,
        "historicalsites",
        paramname,
        paramvalue
      );
      //avatar
      if (body.avatar && body.avatar != "") {
        await FileController.updatesource(
          body.avatar,
          result._id,
          fixedsourcetype.historicalsiteavatar
        );
      }
      //file âm thanh
      try {
        if (body.audiofiles && body.audiofiles.length > 0) {
          for (let i = 0; i < body.audiofiles.length; i++) {
            await FileController.updatesource(
              body.audiofiles[i],
              result._id,
              fixedsourcetype.historicalsiteaudio
            );
          }
        }
      } catch (error) {
        logger.error(error);
      }
      //file scan
      try {
        if (body.scanfiles && body.scanfiles.length > 0) {
          for (let i = 0; i < body.scanfiles.length; i++) {
            await FileController.updatesource(
              body.scanfiles[i],
              result._id,
              fixedsourcetype.historicalsitescanfile
            );
          }
        }
      } catch (error) {
        logger.error(error);
      }
      //file images
      try {
        if (body.images && body.images.length > 0) {
          for (let i = 0; i < body.images.length; i++) {
            await FileController.updatesource(
              body.images[i],
              result._id,
              fixedsourcetype.historicalsiteimage
            );
          }
        }
      } catch (error) {
        logger.error(error);
      }
      //-----------
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
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa điểm di tích lịch sử";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt điểm di tích lịch sử";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa điểm di tích lịch sử";
    resultmessage = i18n.__("deleted_successfully");
  }

  HistoricalSite.findByIdAndUpdate(
    req.body._id,
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
        "historicalsites",
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

//Remove
const remove = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  HistoricalSite.findByIdAndRemove(req.body._id)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa điểm di tích lịch sử",
        process.env.DATABASE_NAME,
        "historicalsites",
        "id",
        req.body._id
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

//Hàm này dùng nội bộ không export: Lấy thêm thông tin files
const mixarea = async (historicalsites, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        historicalsites.map((item) => {
          return AreaController.getareabyid(item._doc.areaid.toString())
            .then((result) => {
              return {
                ...item._doc,
                area: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {
                ...item._doc,
                area: {},
              };
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return AreaController.getareabyid(historicalsites._id.toString())
        .then((result) => {
          return {
            ...historicalsites._doc,
            area: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {
            ...historicalsites._doc,
            area: {},
          };
        });
    }
  } catch (error) {
    logger.error(error);
    return {};
  }
};

//Hàm này dùng nội bộ không export: Lấy thêm thông tin avatar của video
const mixavatar = async (historicalsites, type) => {
  try {    
    if (type == "array") {
      let mixdata = Promise.all(
        historicalsites.map((item) => {
          return FileController.getfilebysource(
            item._id.toString(),
            fixedsourcetype.historicalsiteavatar
          )
            .then((result) => {              
              return {
                ...item,
                avatar: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {
                ...item,
                avatar: {},
              };
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return FileController.getfilebysource(
        historicalsites._doc._id.toString(),
        fixedsourcetype.historicalsiteavatar
      )
        .then((result) => {
          return {
            ...historicalsites._doc,
            avatar: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {
            ...historicalsites._doc,
            avatar: {},
          };
        });
    }
  } catch (error) {
    logger.error(error);
    return {};
  }
};

const mixaudiofile = async (historicalsites, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        historicalsites.map((item) => {
          return FileController.getfilebysource(
            item._id.toString(),
            fixedsourcetype.historicalsiteaudio
          )
            .then((result) => {
              return {
                ...item,
                audiofiles: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {
                ...item,
                audiofiles: [],
              };
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return FileController.getfilebysource(
        historicalsites._doc._id.toString(),
        fixedsourcetype.historicalsiteaudio
      )
        .then((result) => {
          return {
            ...historicalsites,
            audiofiles: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {
            ...historicalsites,
            audiofiles: [],
          };
        });
    }
  } catch (error) {
    logger.error(error);
    return {};
  }
};

const mixscanfile = async (historicalsites, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        historicalsites.map((item) => {
          return FileController.getfilebysource(
            item._id.toString(),
            fixedsourcetype.historicalsitescanfile
          )
            .then((result) => {
              return {
                ...item,
                scanfiles: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {
                ...item,
                scanfiles: [],
              };
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return FileController.getfilebysource(
        historicalsites._doc._id.toString(),
        fixedsourcetype.historicalsitescanfile
      )
        .then((result) => {
          return {
            ...historicalsites,
            audiofiles: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {
            ...historicalsites,
            audiofiles: [],
          };
        });
    }
  } catch (error) {
    logger.error(error);
    return {};
  }
};

const miximages = async (historicalsites, type) => {
  try {    
    if (type == "array") {
      let mixdata = Promise.all(
        historicalsites.map((item) => {
          return FileController.getfilebysource(
            item._id.toString(),
            fixedsourcetype.historicalsiteimage
          )
            .then((result) => {
              return {
                ...item,
                images: result,
              };
            })
            .catch((error) => {
              logger.error(error);
              return {
                ...item,
                images: [],
              };
            });
        })
      );
      return mixdata;
    } else if (type == "object") {
      return FileController.getfilebysource(
        historicalsites._id.toString(),
        fixedsourcetype.historicalsiteimage
      )
        .then((result) => {
          return {
            ...historicalsites,
            images: result,
          };
        })
        .catch((error) => {
          logger.error(error);
          return {
            ...historicalsites,
            images: [],
          };
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
  updatestatus,
  remove,
  edit,
  add,
};
