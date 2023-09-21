const i18n = require("../config/i18n");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const UserController = require("../controllers/UserController");

const verifycallpublicapi = async (req, res, next) => {
  try {
    let apiurl = (req.originalUrl || req.url).trim().toLowerCase();
    let username = req.headers.username;
    let password = req.headers.password;
    const checkaccess = await UserController.checkaccess(
      apiurl,
      username,
      password
    );
    if (checkaccess == 0) {
      res.status(401).json({
        error: 14,
        message: i18n.__("access_denied"),
      });
    } else {
      next();
    }
  } catch (error) {
    logger.error(error);
    res.status(401).json({
      error: 14,
      message: i18n.__("access_denied"),
    });
  }
};

module.exports = verifycallpublicapi;
