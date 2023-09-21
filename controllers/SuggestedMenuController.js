const SuggestedMenu = require("../models/SuggestedMenu");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixedsourcetype = require("../fixeddata/sourcetype.json");
const FileController = require("../controllers/FileController");

//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  SuggestedMenu.find(querystring)
    .sort({ processstatus: 1 })
    .then(async (result) => {
      const mixed = await miximages(result);      
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: mixed,
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
    let suggestmenu = new SuggestedMenu({
      menuname: body.menuname,
      numberdiners: body.numberdiners,
      price: body.price,
      listfood: body.listfood,
      note: body.note,
      status: body.status,
      createduser: audit.username,
    });
    //save
    suggestmenu
      .save()
      .then(async (result) => {
        //log command
        let paramname = "menuname|numberdiners|price|note|listfood|status";
        let paramvalue = `${body.menuname}|${body.numberdiners}|${body.price}||${body.note}|${body.listfood}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới thực đơn đề xuất",
          process.env.DATABASE_NAME,
          "suggestedmenus",
          paramname,
          paramvalue
        );
        //Xử lý ảnh thực đơn (nhiều ảnh)
        try {
          if (body.images && body.images.length > 0) {
            for (let i = 0; i < body.images.length; i++) {
              await FileController.updatesource(
                body.images[i],
                result._id,
                fixedsourcetype.menuimage
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

//delete one image
/*

const deleteimage = (req, res, next) => {
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let suggestid = body._id;
  let arrimages = body.images;
  console.log(arrimages);
  let deleteid = body.deleteid;
  //loai bo deleteid ra khoi mang images
  const indexof = arrimages.indexOf(deleteid);
  if (indexof != -1) {
    arrimages.splice(indexof, 1);
    let updateData = {
      images: arrimages,
    };
    SuggestedMenu.findByIdAndUpdate(
      suggestid,
      { $set: updateData },
      { new: true }
    )
      .then(async (result) => {
        try {
          await FileController.deletefile(deleteid, audit);
        } catch (error) {
          logger.error(error);
        }
        res.json({
          error: 0,
          message: i18n.__("deleted_image_successfully"),
        });
      })
      .catch((error) => {
        logger.error(error);
        res.status(500).json({
          error: 2,
          message: error,
        });
      });
  }
};


*/
//Edit
const edit = (req, res, next) => {
  let suggestid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    menuname: body.menuname,
    numberdiners: body.numberdiners,
    price: body.price,
    listfood: body.listfood,
    note: body.note,
    status: body.status,
    createduser: audit.username,
  };

  //update
  SuggestedMenu.findByIdAndUpdate(
    suggestid,
    { $set: updateData },
    { new: true }
  )
    .then(async (result) => {
      //Log command
      let paramname = "menuname|numberdiners|price|note|listfood|status";
      let paramvalue = `${body.menuname}|${body.numberdiners}|${body.price}||${body.note}|${body.listfood}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Cập nhật thông tin thực đơn đề xuất",
        process.env.DATABASE_NAME,
        "suggestedmenus",
        paramname,
        paramvalue
      );
      //Xử lý ảnh thực đơn (nhiều ảnh)
      try {
        if (body.images && body.images.length > 0) {
          for (let i = 0; i < body.images.length; i++) {
            await FileController.updatesource(
              body.images[i],
              result._id,
              fixedsourcetype.menuimage
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
  let suggestid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa dữ liệu thực đơn đề xuất";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt dữ liệu thực đơn đề xuất";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa dữ liệu thực đơn đề xuất";
    resultmessage = i18n.__("deleted_successfully");
  }

  SuggestedMenu.findByIdAndUpdate(
    suggestid,
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
        "suggestedmenus",
        "suggestid|status",
        `${suggestid}|${req.body.status}`
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
  let suggestid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  SuggestedMenu.findByIdAndRemove(suggestid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa thực đơn đề xuất",
        process.env.DATABASE_NAME,
        "suggestedmenus",
        "suggestid",
        suggestid
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
const miximages = async (suggestedmenus) => {
  try {
    let mixdata = Promise.all(
      suggestedmenus.map((item) => {
        return FileController.getfilebysource(
          item._doc._id.toString(),
          fixedsourcetype.menuimage
        )
          .then((result) => {
            return {
              ...item._doc,
              images: result,
            };
          })
          .catch((error) => {
            logger.error(error);
            return item;
          });
      })
    );
    return mixdata;
  } catch (error) {
    logger.error(error);
    return suggestedmenus;
  }
};

module.exports = {
  getall,
  //deleteimage,
  updatestatus,
  remove,
  add,
  edit,
};
