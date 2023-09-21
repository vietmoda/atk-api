const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema(
  {
    fileurl: {
      type: String,
    },
    filesize: {
      type: Number,
    },
    fileextension: {
      type: String,
    },
    sourcetype: {
      type: Number,
    },
    sourcekey: {
      type: String,
    },
    originalname: {
      type: String,
    },
    createduser: {
      type: String,
    },
  },
  {
    timeseries: true,
  }
);

const File = mongoose.model("files", fileSchema);
module.exports = File;

/*
sourcetype: _id in CategoryItem
 */
