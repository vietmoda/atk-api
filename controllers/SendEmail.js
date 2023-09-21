const log4js = require("../config/log4j");
const logger = log4js.getLogger();
const i18n = require("../config/i18n");
const smtpconfig = require("../config/config.smtpserver.json");
const nodemailer = require("nodemailer");

const sendtextemail = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport(smtpconfig);
    // send email
    await transporter.sendMail({
      from: smtpconfig.auth.user,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.body,
    });
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    //Log command
    LogCommand.add(
      audit,
      "EMAIL",
      "Gửi email text",
      process.env.DATABASE_NAME,
      "",
      "from|to|subject",
      `${smtpconfig.auth.user}|${req.body.to}|${req.body.subject}`
    );

    res.json({
      error: 0,
      message: i18n.__("sent_successfully"),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: 1,
      message: error,
    });
  }
};

const sendhtmlemail = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport(smtpconfig);
    // send email
    await transporter.sendMail({
      from: smtpconfig.auth.user,
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.body,
    });
    let audit = {
      username: req.decodetoken.username,
      clientip: req.headers.clientip,
      deviceinfo: req.headers.deviceinfo,
      devicetype: req.headers.devicetype,
    };
    //Log command
    LogCommand.add(
      audit,
      "EMAIL",
      "Gửi email html",
      process.env.DATABASE_NAME,
      "",
      "from|to|subject",
      `${smtpconfig.auth.user}|${req.body.to}|${req.body.subject}`
    );
    res.json({
      error: 0,
      message: i18n.__("sent_successfully"),
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
  sendtextemail,
  sendhtmlemail,
};
