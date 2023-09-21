const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logCommandSchema = new Schema(
  {
    username: {
      type: String,
    },
    clientip: {
      type: String,
    },
    deviceinfo: {
      type: String,
    },
    devicetype: {
      type: String
    },
    actiontype: {
      type: String,
    },
    actionname: {
      type: String,
    },
    databasename: {
      type: String,
    },
    collectionname: {
      type: String,
    },
    paramname: {
      type: String,
    },
    paramvalue: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LogCommand = mongoose.model("logcommands", logCommandSchema);
module.exports = LogCommand;
