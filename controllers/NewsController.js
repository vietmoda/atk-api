const News = require("../models/News");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixedsourcetype = require("../fixeddata/sourcetype.json");
const fixednewsstatus = require("../fixeddata/newsstatus.json");
const FileController = require("../controllers/FileController");
const Util = require("../assistants/util");
//list
const getall = async (req, res, next) => {
  let status = req.query.status;
  let querystring =
    status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  News.find(querystring, {
    title: 1,
    description: 1,
    keywords: 1,
    newsstatus: 1,
    publishdate: 1,
    author: 1,
    source: 1,
    visited: 1,
    status: 1,
    createduser: 1,
    verifieduser: 1,
    publisheduser: 1,
  })
    .sort({ newsstatus: 1, publishdate: -1 })
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
  //kiem tra trang thai du lieu
  let statusquery =
    query && query.status && query.status != -1 && query.status != ""
      ? { status: query.status }
      : { status: { $ne: 2 } };
  //kiem tra chuyen muc, chuyen de
  let categoryquery = {};
  if (
    query &&
    query.categoryid &&
    query.categoryid != -1 &&
    query.categoryid != ""
  ) {
    //su dung toan tu spread (...)
    categoryquery = {
      ...statusquery,
      listcategoryid: { $in: query.categoryid },
    };
  } else {
    categoryquery = statusquery;
  }
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...categoryquery,
      title: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = categoryquery;
  }
  //kiem tra trang thai xuat ban tin
  let stringquery = {};
  if (
    query &&
    query.newsstatus &&
    query.newsstatus != -1 &&
    query.newsstatus != ""
  ) {
    //su dung toan tu spread (...)
    stringquery = {
      ...searchquery,
      newsstatus: query.newsstatus,
    };
  } else {
    stringquery = searchquery;
  }

  //thoi gian xuat ban
  let publishdate_start =
    query.publishdatestart && query.publishdatestart != ""
      ? Util.todate(query.publishdatestart)
      : Util.todate("01/01/1900");
  let publishdate_end =
    query.publishdateend && query.publishdateend != ""
      ? Util.todate(query.publishdateend)
      : Util.timestamptodate(Date.now());

  //thoi gian nhap tin
  let createddate_start =
    query.createddatestart && query.createddatestart != ""
      ? Util.todate(query.createddatestart)
      : Util.todate("01/01/1900");
  let createddate_end =
    query.createddateend && query.createddateend != ""
      ? Util.todate(query.createddateend)
      : Util.timestamptodate(Date.now());

  stringquery = {
    ...stringquery,
    createdAt: {
      $gte: createddate_start,
      $lte: createddate_end,
    },
  };

  //co nhung tin tuc chua co du lieu ngay xuat ban
  if (
    (query.publishdatestart && query.publishdatestart != "") ||
    (query.publishdateend && query.publishdateend != "")
  ) {
    stringquery = {
      ...stringquery,
      publishdate: {
        $gte: publishdate_start,
        $lte: publishdate_end,
      },
    };
  }

  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;
  News.find(stringquery, {
    title: 1,
    description: 1,
    keywords: 1,
    newsstatus: 1,
    publishdate: 1,
    author: 1,
    source: 1,
    listcategoryid: 1,
    visited: 1,
    status: 1,
    createduser: 1,
    verifieduser: 1,
    publisheduser: 1,
  })
    .sort({ newsstatus: 1, publishdate: -1 })
    .skip(startindex)
    .limit(itemperpage)
    .exec()
    .then(async (result) => {``
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
  News.findById(req.query._id)
    .then(async (result) => {
      const miximage = await mixfile(result, "object");
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

const countbycategory = (req, res, next) => {
  try {
    let query = req.query;
    //kiem tra trang thai du lieu
    let statusquery =
      query && query.status && query.status != -1 && query.status != ""
        ? { status: query.status }
        : { status: { $ne: 2 } };
    //kiem tra chuyen muc, chuyen de
    let categoryquery = {};
    if (
      query &&
      query.categoryid &&
      query.categoryid != -1 &&
      query.categoryid != ""
    ) {
      //su dung toan tu spread (...)
      categoryquery = {
        ...statusquery,
        listcategoryid: { $in: query.categoryid },
      };
    } else {
      categoryquery = statusquery;
    }
    //kiem tra tu khoa
    let searchquery = {};
    if (query && query.keyword && query.keyword != "") {
      //su dung toan tu spread (...)
      searchquery = {
        ...categoryquery,
        title: { $regex: new RegExp(query.keyword, "i") },
      };
    } else {
      searchquery = categoryquery;
    }
    //kiem tra trang thai xuat ban tin
    let stringquery = {};
    if (
      query &&
      query.newsstatus &&
      query.newsstatus != -1 &&
      query.newsstatus != ""
    ) {
      //su dung toan tu spread (...)
      stringquery = {
        ...searchquery,
        newsstatus: query.newsstatus,
      };
    } else {
      stringquery = searchquery;
    }

    //thoi gian xuat ban
    let publishdate_start =
      query.publishdatestart && query.publishdatestart != ""
        ? Util.todate(query.publishdatestart)
        : Util.todate("01/01/1900");
    let publishdate_end =
      query.publishdateend && query.publishdateend != ""
        ? Util.todate(query.publishdateend)
        : Util.timestamptodate(Date.now());

    //thoi gian nhap tin
    let createddate_start =
      query.createddatestart && query.createddatestart != ""
        ? Util.todate(query.createddatestart)
        : Util.todate("01/01/1900");
    let createddate_end =
      query.createddateend && query.createddateend != ""
        ? Util.todate(query.createddateend)
        : Util.timestamptodate(Date.now());

    stringquery = {
      ...stringquery,
      createdAt: {
        $gte: createddate_start,
        $lte: createddate_end,
      },
    };

    //co nhung tin tuc chua co du lieu ngay xuat ban
    if (
      (query.publishdatestart && query.publishdatestart != "") ||
      (query.publishdateend && query.publishdateend != "")
    ) {
      stringquery = {
        ...stringquery,
        publishdate: {
          $gte: publishdate_start,
          $lte: publishdate_end,
        },
      };
    }

    //count
    News.countDocuments(stringquery)
      .then(async (count) => {
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: "",
          data: count,
          prefixcachekey: prefixcachekey,
          cache: false,
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

//pagination with total
const getwithtotal = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let statusquery =
    query && query.status && query.status != -1 && query.status != ""
      ? { status: query.status }
      : { status: { $ne: 2 } };
  //kiem tra chuyen muc, chuyen de
  let categoryquery = {};
  if (
    query &&
    query.categoryid &&
    query.categoryid != -1 &&
    query.categoryid != ""
  ) {
    //su dung toan tu spread (...)
    categoryquery = {
      ...statusquery,
      listcategoryid: { $in: query.categoryid },
    };
  } else {
    categoryquery = statusquery;
  }
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...categoryquery,
      title: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = categoryquery;
  }
  //kiem tra trang thai xuat ban tin
  let stringquery = {};
  if (
    query &&
    query.newsstatus &&
    query.newsstatus != -1 &&
    query.newsstatus != ""
  ) {
    //su dung toan tu spread (...)
    stringquery = {
      ...searchquery,
      newsstatus: query.newsstatus,
    };
  } else {
    stringquery = searchquery;
  }

  //thoi gian xuat ban
  let publishdate_start =
    query.publishdatestart && query.publishdatestart != ""
      ? Util.todate(query.publishdatestart)
      : Util.todate("01/01/1900");
  let publishdate_end =
    query.publishdateend && query.publishdateend != ""
      ? Util.todate(query.publishdateend)
      : Util.timestamptodate(Date.now());

  //thoi gian nhap tin
  let createddate_start =
    query.createddatestart && query.createddatestart != ""
      ? Util.todate(query.createddatestart)
      : Util.todate("01/01/1900");
  let createddate_end =
    query.createddateend && query.createddateend != ""
      ? Util.todate(query.createddateend)
      : Util.timestamptodate(Date.now());

  stringquery = {
    ...stringquery,
    createdAt: {
      $gte: createddate_start,
      $lte: createddate_end,
    },
  };

  //co nhung tin tuc chua co du lieu ngay xuat ban
  if (
    (query.publishdatestart && query.publishdatestart != "") ||
    (query.publishdateend && query.publishdateend != "")
  ) {
    stringquery = {
      ...stringquery,
      publishdate: {
        $gte: publishdate_start,
        $lte: publishdate_end,
      },
    };
  }
  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;
  News.countDocuments(stringquery)
    .then((count) => {
      News.find(stringquery, {
        title: 1,
        description: 1,
        keywords: 1,
        newsstatus: 1,
        publishdate: 1,
        author: 1,
        source: 1,
        listcategoryid: 1,
        visited: 1,
        status: 1,
        createduser: 1,
        verifieduser: 1,
        publisheduser: 1,
      })
        .sort({ newsstatus: 1, publishdate: -1 })
        .skip(startindex)
        .limit(itemperpage)
        .exec()
        .then(async (result) => {
          const miximage = await mixfile(result, "array");
          const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
          res.send({
            error: 0,
            message: "",
            data: miximage,
            total: count,
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
    })
    .catch((counterror) => {
      logger.error(counterror);
      res.status(500).json({
        error: 1,
        message: counterror,
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
    let news = new News({
      title: body.title,
      description: body.description,
      newsbody: body.newsbody,
      listcategoryid: body.listcategoryid,
      keywords: body.keywords,
      newsstatus: body.newsstatus,
      publishdate: "",
      author: body.author,
      source: body.source,
      visited: 0,
      status: body.status,
      createduser: audit.username,
      verifieduser: "",
      publisheduser: "",
    });
    //check newsstatus
    if (body.newsstatus == 1) {
      news.verifieduser = audit.username;
    } else if (body.newsstatus == 2) {
      news.verifieduser = audit.username;
      news.publisheduser = audit.username;
      if (body.publishdate && body.publishdate != "") {
        news.publishdate = Util.todate(body.publishdate);
      }
    }
    //save
    news
      .save()
      .then(async (result) => {
        //log command
        let paramname = "title|newsstatus|publishdate|author|source|status";
        let paramvalue = `${body.title}|${body.newsstatus}|${body.publishdate}||${body.author}|${body.source}|${body.status}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới bài viết",
          process.env.DATABASE_NAME,
          "news",
          paramname,
          paramvalue
        );
        //Xử lý file nếu có
        if (body.image && body.image != "") {
          await FileController.updatesource(
            body.image,
            result._id,
            fixedsourcetype.newstitleimage
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
  let newsid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    title: body.title,
    description: body.description,
    newsbody: body.newsbody,
    listcategoryid: body.listcategoryid,
    keywords: body.keywords,
    publishdate: "",
    newsstatus: body.newsstatus,
    author: body.author,
    source: body.source,
  };

  if (body.publishdate && body.publishdate != "") {
    updateData.publishdate = Util.todate(body.publishdate);
  }

  //update
  News.findByIdAndUpdate(newsid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname = "title|author|source|publishdate|status";
      let paramvalue = `${body.title}|${body.author}|${body.source}|${body.publishdate}|${body.status}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin bài viết",
        process.env.DATABASE_NAME,
        "news",
        paramname,
        paramvalue
      );
      //Xử lý filevideo nếu có
      if (body.image != body.imageolder) {
        if (body.image && body.image != "") {
          await FileController.updatesource(
            body.image,
            result._id,
            fixedsourcetype.newstitleimage,
            audit
          );
          //Xóa avatar cũ đi
          if (
            body.imageolder &&
            body.imageolder != "" &&
            body.imageolder != undefined
          )
            try {
              await FileController.deletefile(body.imageolder, audit);
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
  let newsid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: req.body.status,
  };
  let actionname = "Vô hiệu hóa bài viết";
  let resultmessage = i18n.__("inactive_successfully");
  if (req.body.status == 1) {
    actionname = "Kích hoạt bài viết";
    resultmessage = i18n.__("active_successfully");
  } else if (req.body.status == 2) {
    actionname = "Đánh dấu xóa bài viết";
    resultmessage = i18n.__("deleted_successfully");
  }

  News.findByIdAndUpdate(newsid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "STATUS",
        actionname,
        process.env.DATABASE_NAME,
        "news",
        "newsid|status",
        `${newsid}|${req.body.status}`
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
  let newsid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  News.findByIdAndRemove(newsid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa bài viết",
        process.env.DATABASE_NAME,
        "news",
        "newsid",
        newsid
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
const mixfile = async (newss, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        newss.map((item) => {
          return FileController.getfilebysource(
            item._doc._id.toString(),
            fixedsourcetype.newstitleimage
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
        newss._doc._id.toString(),
        fixedsourcetype.newstitleimage
      )
        .then((result) => {
          return {
            ...newss._doc,
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
  countbycategory,
  getwithtotal,
  updatestatus,
  remove,
  edit,
  add,
};
