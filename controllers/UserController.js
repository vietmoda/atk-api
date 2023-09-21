const GroupController = require("../controllers/GroupController");
const FileControoler = require("../controllers/FileController");
const User = require("../models/User");
const Group = require("../models/Group");
const File = require("../models/File");
const LogCommand = require("../controllers/LogCommandController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fixeddatasourcetype = require("../fixeddata/sourcetype.json");
const i18n = require("../config/i18n");

const log4js = require("../config/log4j");
const logger = log4js.getLogger();

const cachekey = require("../assistants/cachekey");

//Show list of Users
const getall = (req, res, next) => {
  let status = req.query.status;
  let querystring = status && status != -1 ? { status: status } : { status: { $ne: 2 } };
  User.find(querystring)
    .then(async (result) => {
      let resultmixed = await mixavatartouser(result, "array");
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: resultmixed,
        cache: false,
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

//get detail by ID or username
const getbyid = (req, res, next) => {
  let userid = req.query._id;
  User.findById(userid)
    .then(async (result) => {
      let resultmixed = await mixavatartouser(result, "object");
      //------------------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: resultmixed,
        cache: false,
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

//get detail by ID or username
const getbyusername = (req, res, next) => {
  let username = req.query.username;
  let avatar = "";
  User.find({ username: username })
    .then(async (result) => {
      await File.find({
        $and: [
          { sourcetype: fixeddatasourcetype.useravatar },
          { sourcekey: result._id },
        ],
      })
        .then((fileResult) => {
          avatar = fileResult;
        })
        .catch((error) => {
          logger.error(error);
          res.json({
            error: 1,
            message: error,
          });
        });
      //-------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: "",
        data: {
          user: result,
          avatar: avatar,
        },
        cache: false,
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

//Destroy an User
const destroy = (req, res, next) => {
  let userid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let updateData = {
    status: 2,
  };
  User.findByIdAndUpdate(userid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "DESTROY",
        "Vô hiệu hóa người dùng",
        process.env.DATABASE_NAME,
        "users",
        "userid",
        userid
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("destroyed_successfully"),
        data: result._id,
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

//Remove an User
const remove = (req, res, next) => {
  let userid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  User.findByIdAndRemove(userid)
    .then(async (result) => {
      //Log command
      LogCommand.add(
        audit,
        "REMOVE",
        "Xóa thông tin người dùng",
        process.env.DATABASE_NAME,
        "users",
        "userid",
        userid
      );
      //-----------
      const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
      res.send({
        error: 0,
        message: i18n.__("deleted_successfully"),
        result: userid,
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

//Edit an User
const edit = (req, res, next) => {
  let userid = req.body._id;
  let audit = {
    username: req.decodetoken.username,
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  let body = req.body;
  let updateData = {
    username: body.username,
    fullname: body.fullname,
    email: body.email,
    address: body.address,
    position: body.position,
    telephone: body.telephone,
    organizationid: body.organizationid,
    status: body.status,
    usertype: body.usertype,
    roleid: body.roleid,
    grouproleid: body.grouproleid,
  };

  User.findByIdAndUpdate(userid, { $set: updateData }, { new: true })
    .then(async (result) => {
      //Log command
      let paramname =
        "userid|username|password|fullname|email|address|position|telephone|organizationid|status|usertype|roleid|grouproleid";
      let paramvalue = `${userid}|${body.username}|${body.password}|${body.fullname}|${body.email}|${body.address}|${body.position}|${body.telephone}|${body.organizationid}|${body.status}|${body.usertype}|${body.roleid}|${body.grouproleid}`;
      LogCommand.add(
        audit,
        "EDIT",
        "Sửa thông tin người dùng",
        process.env.DATABASE_NAME,
        "users",
        paramname,
        paramvalue
      );
      //Xử lý avatar nếu có
      if (body.avatar != body.avatarolder) {
        if (body.avatar && body.avatar != "") {
          await FileControoler.updatesource(
            body.avatar,
            result._id,
            fixeddatasourcetype.useravatar,
            audit
          );
          //Xóa avatar cũ đi
          if (
            body.avatarolder &&
            body.avatarolder != "" &&
            body.avatarolder != undefined
          )
            try {
              await FileControoler.deletefile(body.avatarolder, audit);
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

//Add new an User
const add = (req, res, next) => {
  let body = req.body;
  let audit = {
    username: req.decodetoken.username,
    //username: 'admin',
    clientip: req.headers.clientip,
    deviceinfo: req.headers.deviceinfo,
    devicetype: req.headers.devicetype,
  };
  //hash the user's password
  bcrypt.hash(req.body.password, 10, function (err, hashedpass) {
    if (err) {
      res.json({
        error: 3,
        message: err,
      });
    }
    let user = new User({
      username: body.username,
      password: hashedpass,
      fullname: body.fullname,
      email: body.email,
      address: body.address,
      position: body.position,
      telephone: body.telephone,
      organizationid: body.organizationid,
      status: body.status,
      usertype: body.usertype,
      roleid: body.roleid,
      grouproleid: body.grouproleid,
      lastchangepassword: Date.now(),
      createduser: audit.username,
    });
    user
      .save()
      .then(async (result) => {
        //log command
        let paramname =
          "username|password|fullname|email|address|position|telephone|organizationid|status|file";
        let paramvalue = `${body.username}|${body.password}|${body.fullname}|${body.email}|${body.address}|${body.position}|${body.telephone}|${body.organizationid}|${body.status}|${body.avatar}`;
        LogCommand.add(
          audit,
          "ADD",
          "Thêm mới người dùng",
          process.env.DATABASE_NAME,
          "users",
          paramname,
          paramvalue
        );
        //Xử lý avatar nếu có
        if (body.avatar && body.avatar != "") {
          await FileControoler.updatesource(
            body.avatar,
            result._id,
            fixeddatasourcetype.useravatar
          );
        }
        //-----------
        const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
        res.send({
          error: 0,
          message: i18n.__("added_successfull"),
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
  });
};

//user login, return token when successfull
const login = (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  let audit = req.body.audit;

  User.findOne({ username: username }).then((user) => {
    if (user) {
      if (user.status == 1) {
        //hash this input password before compare with user's password)
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            res.json({
              error: 3,
              message: error,
            });
          }
          if (result) {
            //Log command
            let paramname = "username|password";
            let paramvalue = `${username}|${password}`;
            LogCommand.add(
              audit,
              "LOGIN",
              "Đăng nhập",
              process.env.DATABASE_NAME,
              "users",
              paramname,
              paramvalue
            );
            //-----------
            let tokencreated = Date.now();
            let token = jwt.sign(
              {
                //name: `${user.username}|${user.usertype}|${user.email}|${user.telephone}|${user.organizationid}|${tokencreated}|${process.env.CACHE_TIMETOLIVE_SECONTS}`,
                username: user.username,
                usertype: user.usertype,
                email: user.email,
                telephone: user.telephone,
                organization: user.organizationid,
                created: tokencreated,
                timelivesecond: process.env.CACHE_TIMETOLIVE_SECONTS,
              },
              process.env.CACHE_HASHKEY,
              { expiresIn: "2h" }
            );
            res.json({
              error: 0,
              message: i18n.__("login_successful"),
              token: token,
              data: user,
            });
          } else {
            //save fail login infomation
            res.json({
              error: 1,
              message: i18n.__("login_fail_password"),
            });
          }
        });
      } else {
        res.json({
          error: 3,
          message: i18n.__("login_inactive"),
        });
      }
    } else {
      //save fail login infomation
      res.json({
        error: 2,
        message: i18n.__("login_fail_username"),
      });
    }
  });
};

//add remove role
const grandrole = (req, res, next) => {
  try {
    let userid = req.body.userid;
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    let body = req.body;
    let updateData = {
      roleid: body.roleid,
      grouproleid: body.grouproleid,
    };
    User.findByIdAndUpdate(userid, { $set: updateData }, { new: true })
      .then((result) => {
        //Log command
        let paramname = "userid|roleid|grouproleid";
        let paramvalue = `${userid}|${body.roleid}|${body.grouproleid}`;
        LogCommand.add(
          audit,
          "ROLE",
          "Thay đổi quyền thao tác của người dùng",
          process.env.DATABASE_NAME,
          "users",
          paramname,
          paramvalue
        );
        //-----------
        res.send({
          error: 0,
          message: i18n.__("user_editrole_successfully"),
          data: result._id,
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
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

//check role user: role có thể nằm trong listroleid hoặc nằm trong các nhóm quyền tại listgroupid
//Kiểm tra roleid của người dùng có chứa quyền này không . Tùy chọn i trong biểu thức chính quy để không phân biệt HOA - thường
//Parameter "filter" to find() must be an object: Tham số trong find phải là đối tượng JSON
const checkrole = (req, res, next) => {
  try {
    //Lấy thông tin
    const roleid = req.query.roleid;
    const username = req.query.username;
    User.find({
      username: username,
    })
      .then(async (result) => {
        //Kiểm tra role
        let userlistrole = result[0].roleid;
        for (let i = 0; i < userlistrole.length; i++) {
          if (userlistrole[i] == roleid) {
            res.send({
              error: 0,
              message: i18n.__("user_checkrole_successfully"),
              data: 1,
            });
          }
        }
        //Nếu ko có role thì kiểm tra tiếp tới role trong group
        let userlistgroup = result[0].grouproleid;
        for (let i = 0; i < userlistgroup.length; i++) {
          let ingroup = await GroupController.ingroup(roleid, userlistgroup[i]);
          if (ingroup == 1) {
            res.send({
              error: 0,
              message: i18n.__("user_checkgrouprole_successfully"),
              data: 1,
              prefixcachekey: prefixcachekey,
            });
          } else {
            res.send({
              error: 0,
              message: i18n.__("permission_denied"),
              data: 0,
            });
          }
        }
      })
      .catch((error) => {
        logger.error(error);
        res.status(500).json({
          error: 2,
          message: error,
          data: 0,
        });
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: err,
      data: 0,
    });
  }
};


//Hàm này cũng để check role nhưng để gọi nội bộ không ra API
const checkpermission = async (username, roleid) => {
  let ispermission = 0; 
  try {    
    await User.find({
      username: username,
    })
      .then(async (result) => {        
        //Kiểm tra role
        let userlistrole = result[0].roleid;
        for (let i = 0; i < userlistrole.length; i++) {
          if (userlistrole[i] == roleid) {
            ispermission = 1; //Có quyền
          }
        }
        //Nếu ko có role thì kiểm tra tiếp tới role trong group
        let userlistgroup = result[0].grouproleid;
        for (let i = 0; i < userlistgroup.length; i++) {
          let ingroup = await GroupController.ingroup(roleid, userlistgroup[i]);          
          if (ingroup == 1) {
            ispermission = 1; //Có quyền
            break;
          } 
        }
        //Duyet het cac group ma van khong co tuc la khong co quyen        
      })
      .catch((error) => {
        logger.error(error);
        ispermission = 0;
      });
  } catch (error) {
    logger.error(error);
    ispermission = 0;
  }
  return ispermission;
};

//Hàm này dùng nội bộ không export: Lấy thêm thông tin avatar của user
const mixavatartouser = async (users, type) => {
  try {
    if (type == "array") {
      let mixdata = Promise.all(
        users.map((user) => {
          return FileControoler.getfilebysource(
            user._doc._id.toString(),
            fixeddatasourcetype.useravatar
          )
            .then((result) => {
              return {
                ...user._doc,
                avatar: result,
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
      return FileControoler.getfilebysource(
        users._id.toString(),
        fixeddatasourcetype.useravatar
      )
        .then((result) => {
          return {
            ...users._doc,
            avatar: result,
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
  getbyusername,
  getbyid,
  add,
  edit,
  destroy,
  remove,
  login,
  grandrole,
  checkrole,
  checkpermission
};
