const Video = require("../models/Video");
const LogCommand = require("../controllers/LogCommandController");
const i18n = require("../config/i18n");
const cachekey = require("../assistants/cachekey");
const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const fixeddatasourcetype = require("../fixeddata/sourcetype.json");
const FileController = require("../controllers/FileController");

//list 
const getall = async (req, res, next) => {    
    let status = req.query.status;
    let querystring = status && status != -1 ? { status: status } : { status: { $ne: 2 } };
    Video.find(querystring)
        .then(async (result) => {               
            let mixresultavatar = await mixavatar(result, "array");                   
            let mixresultfile = await mixfile(mixresultavatar, "array");                     
            const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
            res.send({
                error: 0,
                message: "",
                data: mixresultfile,
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
    let query = req.query
    let statusquery = (query && query.status && query.status != -1) ? { status: query.status } : { status: { $ne: 2 } };
    let stringquery = {}
    if (query && query.categoryid && query.categoryid != -1) {
        //su dung toan tu spread (...)
        stringquery = {
            ...statusquery,
            categoryid: query.categoryid
        }
    } else {
        stringquery = statusquery;
    }
    Video.find(stringquery)
        .then(async (result) => {
            let mixresultavatar = await mixavatar(result, "array");
            let mixresultfile = await mixfile(mixresultavatar, "array");
            const prefixcachekey = await cachekey.getprefixbyurl(req.originalUrl);
            res.send({
                error: 0,
                message: "",
                data: mixresultfile,
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
    Video.findById(req.query._id)
        .then(async (result) => {
            let mixresultavatar = await mixavatar(result, "object");                   
            let mixresultfile = await mixfile(mixresultavatar, "object");     
            res.send({
                error: 0,
                message: "",
                data: mixresultfile,
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
        let video = new Video({
            videoname: body.videoname,
            description: body.description,
            videourl: body.videourl,
            categoryid: body.categoryid,
            status: body.status,
            createduser: audit.username,
        });
        video
            .save()
            .then(async (result) => {
                //log command
                let paramname = "videoname|description|videourl|categoryid|status";
                let paramvalue = `${body.videoname}|${body.description}|${body.videourl}||${body.categoryid}|${body.status}`;
                LogCommand.add(
                    audit,
                    "ADD",
                    "Thêm mới video",
                    process.env.DATABASE_NAME,
                    "videos",
                    paramname,
                    paramvalue
                );
                //Xử lý avatar nếu có
                if (body.videoavatar && body.videoavatar != "") {
                    await FileController.updatesource(
                        body.videoavatar,
                        result._id,
                        fixeddatasourcetype.videoavatar
                    );
                }
                //Xử lý file nếu có
                if (body.fileid && body.fileid != "") {
                    await FileController.updatesource(
                        body.fileid,
                        result._id,
                        fixeddatasourcetype.videofile
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

//Edit a role
const edit = (req, res, next) => {
    let videoid = req.body._id;
    let audit = {
        username: req.decodetoken.username,
        clientip: req.headers.clientip,
        deviceinfo: req.headers.deviceinfo,
        devicetype: req.headers.devicetype,
    };
    let body = req.body;
    let updateData = {
        videoname: body.videoname,
        description: body.description,
        videourl: body.videourl,
        categoryid: body.categoryid,
        status: body.status,
    };
    Video.findByIdAndUpdate(videoid, { $set: updateData }, { new: true })
        .then(async (result) => {
            //Log command
            let paramname = "videoid|videoname|description|videourl|categoryid|status";
            let paramvalue = `${videoid}|${body.videoname}|${body.description}|${body.videourl}||${body.categoryid}|${body.status}`;
            LogCommand.add(
                audit,
                "EDIT",
                "Sửa thông tin video",
                process.env.DATABASE_NAME,
                "videos",
                paramname,
                paramvalue
            );
            //Xử lý filevideo nếu có
            if (body.fileid != body.fileidolder) {
                if (body.fileid && body.fileid != "") {
                    await FileController.updatesource(
                        body.fileid,
                        result._id,
                        fixeddatasourcetype.videofile,
                        audit
                    );
                    //Xóa avatar cũ đi
                    if (
                        body.fileidolder &&
                        body.fileidolder != "" &&
                        body.fileidolder != undefined
                    )
                        try {
                            await FileController.deletefile(body.fileidolder, audit);
                        } catch (error) {
                            logger.error(error);
                        }
                }
            }
            //Xử lý avatar video nếu có
            if (body.videoavatar != body.videoavatarolder) {
                if (body.videoavatar && body.videoavatar != "") {
                    await FileController.updatesource(
                        body.videoavatar,
                        result._id,
                        fixeddatasourcetype.videoavatar,
                        audit
                    );
                    //Xóa avatar cũ đi
                    if (
                        body.videoavatarolder &&
                        body.videoavatarolder != "" &&
                        body.videoavatarolder != undefined
                    )
                        try {
                            await FileController.deletefile(body.videoavatarolder, audit);
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
    let videoid = req.body._id;
    let audit = {
        username: req.decodetoken.username,
        clientip: req.headers.clientip,
        deviceinfo: req.headers.deviceinfo,
        devicetype: req.headers.devicetype,
    };
    let updateData = {
        status: req.body.status,
    };
    let actionname = "Vô hiệu hóa video";
    let resultmessage = i18n.__("inactive_successfully");
    if (req.body.status == 1) {
        actionname = "Kích hoạt video";
        resultmessage = i18n.__("active_successfully");
    } else if (req.body.status == 2) {
        actionname = "Đánh dấu xóa video";
        resultmessage = i18n.__("deleted_successfully");
    }

    Video.findByIdAndUpdate(videoid, { $set: updateData }, { new: true })
        .then(async (result) => {
            //Log command
            LogCommand.add(
                audit,
                "STATUS",
                actionname,
                process.env.DATABASE_NAME,
                "videos",
                "videoid|status",
                `${videoid}|${req.body.status}`
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
    let videoid = req.body._id;
    let audit = {
        username: req.decodetoken.username,
        clientip: req.headers.clientip,
        deviceinfo: req.headers.deviceinfo,
        devicetype: req.headers.devicetype,
    };
    Video.findByIdAndRemove(videoid)
        .then(async (result) => {
            //Log command
            LogCommand.add(
                audit,
                "REMOVE",
                "Xóa video",
                process.env.DATABASE_NAME,
                "videos",
                "videoid",
                videoid
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
const mixavatar = async (videos, type) => {
    try {
        if (type == "array") {
            let mixdata = Promise.all(
                videos.map((video) => {
                    return FileController.getfilebysource(
                        video._doc._id.toString(),
                        fixeddatasourcetype.videoavatar
                    )
                        .then((result) => {
                            return {
                                ...video._doc,
                                videoavatar: result,
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
                videos._id.toString(),
                fixeddatasourcetype.videoavatar
            )
                .then((result) => {                    
                    return {
                        ...videos,
                        videoavatar: result,
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

//Hàm này dùng nội bộ không export: Lấy thêm thông tin avatar của video
const mixfile = async (videos, type) => {
    try {
        if (type == "array") {                       
            let mixdata = Promise.all(
                videos.map((video) => {
                    return FileController.getfilebysource(
                        video._id.toString(),
                        fixeddatasourcetype.videofile
                    )
                        .then((result) => {
                            return {
                                ...video,
                                videofile: result,
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
                videos._id.toString(),
                fixeddatasourcetype.videofile
            )
                .then((result) => {
                    return {
                        ...videos,
                        videofile: result,
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
    updatestatus,
    remove,
    edit,
    add
};
