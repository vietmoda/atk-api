const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const dbconfig =
  process.env.NODE_ENV === "production"
    ? require("../config/config.prod.json")
    : require("../config/config.dev.json");

const redis = require("redis");
//Khai báo toàn cục để không thực hiện mở lại kết nối nhiều lần
const redisclient = redis.createClient(dbconfig.REDIS_CONNECT);

const resetcache = async (req, res, next) => {
  if (req.method == "POST" || req.method == "PUT" || req.method == "DELETE") {
    const usecache = process.env.USE_CACHE || false;
    if (usecache == 1) {
      //Kiểm tra xem kiểu cấu hình xóa cache là xóa hết hay xóa từng key liên quan
      const refreshcachetype = process.env.REFRESH_CACHE_TYPE;
      if (!redisclient.isOpen) {
        try {
          await redisclient.connect();
        } catch (error) {
          logger.error(error);
          next();
        }
      }
      res.sendResponse = res.send;
      res.send = (body) => {
        //Chỉ thực thi xóa cache nếu thao tác dữ liệu thành công
        if (body.error == 0) {
          if (refreshcachetype == 2) {
            redisclient
              .keys(`*${body.prefixcachekey}*`)
              .then(async (keys) => {
                for (let i = 0; i < keys.length; i++) {
                  await redisclient
                    .del(keys[i])
                    .then(() => {
                      logger.info(`Redis: del key ${keys[i]}`);
                    })
                    .catch((error) => {
                      logger.error(error);
                    });
                }
                res.sendResponse(body);
              })
              .catch((error) => {
                logger.error(error);
                res.sendResponse(body);
              });
          } else {
            redisclient
              .flushAll()
              .then(() => {
                logger.info("Flushall cache");
              })
              .catch((error) => {
                logger.error(error);
              });
            res.sendResponse(body);
          }
        } else {
          res.sendResponse(body);
        }
      };
      next();
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = resetcache;
