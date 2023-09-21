const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const dbconfig =
  process.env.NODE_ENV === "production"
    ? require("../config/config.prod.json")
    : require("../config/config.dev.json");

const cachekey = require("../assistants/cachekey");

const redis = require("redis");
//Khai báo toàn cục để không thực hiện mở lại kết nối nhiều lần
const redisclient = redis.createClient(dbconfig.REDIS_CONNECT);

const caching = async (req, res, next) => {
  try {
    if (req.method == "GET") {
      //Kiểm tra cấu hình bật cache hay không
      const usecache = process.env.USE_CACHE || false;
      if (usecache == 1) {
        //Kiểm tra xem đã mở kết nối tới Redis Server chưa?
        if (!redisclient.isOpen) {
          try {
            await redisclient.connect();
          } catch (error) {
            logger.error(error);
            next();
          }
        }
        //Lấy dữ liệu từ cache theo key 
        let key = req.originalUrl || req.url;
        let fullkey = await cachekey.getcachekey(key);
        redisclient
          .get(fullkey)
          .then((cachedata) => {
            if (cachedata) {
              console.log(`Cache from key: ${fullkey}`);
              //Chuyển đổi chuối JSON trong cache thành đối tượng JavaScript trước khi gửi về Client
              let body = JSON.parse(cachedata);
              body.cache = true;
              res.send(body);
            } else {
              console.log("Database: Get data from API");
              //Định nghĩa 1 hàm (tên tùy ý) để làm nhiệm vụ send response về client
              res.sendResponse = res.send;
              //Ghi đè nội dung của phương thức send của đối tượng res của Express
              res.send = (body) => {               
                if (body.prefixcachekey != undefined) {
                  key = `${body.prefixcachekey}_${key}`;
                }                
                redisclient
                  .setEx(
                    key.toString(),
                    process.env.CACHE_TIMETOLIVE_SECONTS,
                    body
                  )
                  .then(() => {
                    res.sendResponse(body);
                  })
                  .catch((error) => {
                    //logger.error(`Set key ${key} error: ${error}`);
                    res.sendResponse(body);
                  });
              };
              next();
            }
          })
          .catch((error) => {
            logger.error(error);
            res.send({
              error: 2,
              message: error,
            });
          });
      } else {
        next();
      }
    } else {
      //Method is'nt GET
      next();
    }
  } catch (error) {
    logger.error(error);
    res.send({
      error: 1,
      message: error,
    });
  }
};

module.exports = caching;
