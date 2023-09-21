const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const UserController = require("../controllers/UserController");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
//Method + URL => RoleID
/*accepttype:
admin: Mặc định cho phép tài khoản admin được thao tác
user: Kiểm tra quyền, nếu có mới được thao tác
guest: Không cần kiểm tra quyền
*/
const permission = async (req, res, next) => {
  try {
    let method = req.method.trim().toLowerCase();
    let url = (req.originalUrl || req.url).trim().toLowerCase();
    let username = req.decodetoken.username.toLowerCase();
    //console.log(`${method}-${url}`);
    let cacheobject = await cachekey.getcacheobject(method, url);    
    //console.log(cacheobject);    
    if (cacheobject == null || cacheobject == {}) {
      next();
    } else {      
      if (cacheobject.accepttype == "admin" && username == "admin") {
        //tài khoản admin, thao tác ở chức năng cấu hình mặc định cho admin        
        next();
      } else {
        if (cacheobject.accepttype == "guest") {
          //chức năng dành cho khách          
          next();
        } else {          
          let checkpermission = await UserController.checkpermission(
            username,
            cacheobject.roleid
          );          
          if (checkpermission > 0) {
            next();
          } else {
            res.status(401).json({
              error: 7,
              message: i18n.__("permission_denied"),
            });
          }
        }
      }
    }
  } catch (error) {
    logger.error(error);
    next();
  }
};

module.exports = permission;
