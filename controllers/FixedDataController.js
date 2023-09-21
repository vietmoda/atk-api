const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixeddatastatus = require("../fixeddata/datastatus.json");
const fixedlanguage = require("../fixeddata/language.json");
const fixedsourcetype = require("../fixeddata/sourcetype.json");
const fixedusertype = require("../fixeddata/usertype.json");
const fixednewscategorytype = require("../fixeddata/newscategorytype.json");
const fixedweblinkviewtype = require("../fixeddata/weblinkviewtype.json");
const fixednewsstatus = require("../fixeddata/newsstatus.json");
const fixedservice = require("../fixeddata/service.json");
const fixedprocessstatus = require("../fixeddata/processstatus.json");

const processstatus = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedprocessstatus,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const newsstatus = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixednewsstatus,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const weblinkviewtype = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedweblinkviewtype,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const newscategorytype = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixednewscategorytype,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const datastatus = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixeddatastatus,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const language = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedlanguage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const sourcetype = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedsourcetype,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const usertype = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedusertype,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const service = (req, res, next) => {
  try {
    res.json({
      error: 0,
      message: "",
      data: fixedservice,
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
  datastatus,
  language,
  sourcetype,
  usertype,
  newscategorytype,
  weblinkviewtype,
  newsstatus,
  processstatus,
  service
};
