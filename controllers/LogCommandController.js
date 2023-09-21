const LogCommand = require("../models/LogCommand");
const Util = require("../assistants/util");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const cachekey = require("../assistants/cachekey");

//Add new a log command
const add = (
  audit,
  actiontype,
  actionname,
  databasename,
  collectionname,
  paramname,
  paramvalue
) => {
  try {    
    let logCommand = new LogCommand({
      clientip: audit.clientip,
      deviceinfo: audit.deviceinfo,
      devicetype: audit.devicetype,
      actiontype: actiontype,
      actionname: audit.username,
      databasename: databasename,
      collectionname: collectionname,
      paramname: paramname,
      paramvalue: paramvalue,
    });
    logCommand
      .save()
      .then(() => {
        console.log("Writed log command!");
      })
      .catch((errr) => {
        console.log(errr);
      });
  } catch (error) {
    //console.log(error);
  }
};

//list by cat
const searchlog = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let typequery =
    query && query.actiontype && query.actiontype != ""
      ? { actiontype: query.actiontype }
      : {};
  //kiem tra chuyen muc, chuyen de
  let collectionquery = {};
  if (query && query.collectionname && query.collectionname != "") {
    //su dung toan tu spread (...)
    collectionquery = {
      ...typequery,
      collectionname: query.collectionname,
    };
  } else {
    collectionquery = typequery;
  }
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...collectionquery,
      paramvalue: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = {
      ...collectionquery,
    };
  }

  //thoi gian
  let startdate =
    query.startdate && query.startdate != ""
      ? Util.todate(query.startdate)
      : Util.todate("01/01/1900");
  let enddate =
    query.enddate && query.enddate != ""
      ? Util.todate(query.enddate)
      : Util.timestamptodate(new Date.now());

  let stringquey = {
    ...searchquery,
    createdAt: {
      $gte: startdate,
      $lte: enddate,
    },
  };

  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;
  LogCommand.find(stringquey)
    .sort({ createdAt: -1 })
    .skip(startindex)
    .limit(itemperpage)
    .exec()
    .then((result) => {
      //const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.json({
        error: 0,
        message: "",
        data: result,
        prefixcachekey: "",
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

//pagination with total
const getwithtotal = async (req, res, next) => {
  let query = req.query;
  //kiem tra trang thai du lieu
  let typequery =
    query && query.actiontype && query.actiontype != ""
      ? { actiontype: query.actiontype }
      : {};
  //kiem tra chuyen muc, chuyen de
  let collectionquery = {};
  if (query && query.collectionname && query.collectionname != "") {
    //su dung toan tu spread (...)
    collectionquery = {
      ...typequery,
      collectionname: query.collectionname,
    };
  } else {
    collectionquery = typequery;
  }
  //kiem tra tu khoa
  let searchquery = {};
  if (query && query.keyword && query.keyword != "") {
    //su dung toan tu spread (...)
    searchquery = {
      ...collectionquery,
      paramvalue: { $regex: new RegExp(query.keyword, "i") },
    };
  } else {
    searchquery = {
      ...collectionquery,
    };
  }

  //thoi gian
  let startdate =
    query.startdate && query.startdate != ""
      ? Util.todate(query.startdate)
      : Util.todate("01/01/1900");
  let enddate =
    query.enddate && query.enddate != ""
      ? Util.todate(query.enddate)
      : Util.timestamptodate(new Date.now());

  let stringquey = {
    ...searchquery,
    createdAt: {
      $gte: startdate,
      $lte: enddate,
    },
  };

  //phan trang
  const itemperpage = query.itemperpage;
  const currentpage = query.currentpage;
  const startindex = (currentpage - 1) * itemperpage;

  LogCommand.countDocuments(stringquey)
    .then((count) => {
      LogCommand.find(stringquey)
        .sort({ createdAt: -1 })
        .skip(startindex)
        .limit(itemperpage)
        .exec()
        .then((result) => {
          //const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
          res.json({
            error: 0,
            message: "",
            data: result,
            total: count,
            prefixcachekey: "",
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

const count = (req, res, next) => {
  try {
    let query = req.query;
    //kiem tra trang thai du lieu
    let typequery =
      query && query.actiontype && query.actiontype != ""
        ? { actiontype: query.actiontype }
        : {};
    //kiem tra chuyen muc, chuyen de
    let collectionquery = {};
    if (query && query.collectionname && query.collectionname != "") {
      //su dung toan tu spread (...)
      collectionquery = {
        ...typequery,
        collectionname: query.collectionname,
      };
    } else {
      collectionquery = typequery;
    }
    //kiem tra tu khoa
    let searchquery = {};
    if (query && query.keyword && query.keyword != "") {
      //su dung toan tu spread (...)
      searchquery = {
        ...collectionquery,
        paramvalue: { $regex: new RegExp(query.keyword, "i") },
      };
    } else {
      searchquery = {
        ...collectionquery,
      };
    }

    //thoi gian
    let startdate =
      query.startdate && query.startdate != ""
        ? Util.todate(query.startdate)
        : Util.todate("01/01/1900");
    let enddate =
      query.enddate && query.enddate != ""
        ? Util.todate(query.enddate)
        : Util.timestamptodate(new Date.now());

    let stringquey = {
      ...searchquery,
      createdAt: {
        $gte: startdate,
        $lte: enddate,
      },
    };
    //
    LogCommand.countDocuments(stringquey)
      .then((count) => {
        //const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.json({
          error: 0,
          message: "",
          data: count,
          prefixcachekey: "",
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

module.exports = {
  add,
  searchlog,
  getwithtotal,
  count,
};
