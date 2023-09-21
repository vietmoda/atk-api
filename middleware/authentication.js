const jwt = require("jsonwebtoken");
const i18n = require("../config/i18n");

const authentication = (req, res, next) => {
  try {    
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.CACHE_HASHKEY);
    req.decodetoken = decode;
    //console.log(decode)
    //Date.now(): Trả về số mili giây tính từ thời điểm Unix epoch (là 1/1/1970 00:00:00 UTC) đến ngày giờ hiện tại của máy chủ
    const timelivesecond =
      (Date.now() - Number.parseInt(decode.created)) / 1000;
    if (timelivesecond > decode.timelivesecond) {
      res.status(401).json({
        error: 15,
        message: i18n.__("token_expired"),
      });
    } else {
      next();
    }       
  } catch (error) {
    //console.log(error);
    res.status(401).json({
      error: 14,
      message: i18n.__("authentication_failed"),
    });
  }
};

module.exports = authentication;
