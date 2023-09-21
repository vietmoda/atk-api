const log4js = require("log4js");

log4js.configure({
  appenders: { app: { type: "file", filename: "logs/app.log" } },
  categories: { default: { appenders: ["app"], level: "info" } },
});

module.exports = log4js;
