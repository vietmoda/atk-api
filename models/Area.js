const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const areaSchema = new Schema(
  {
    code: {
      type: String,
    },
    name: {
      type: String,
    },
    parentid: {
      type: String,
    },
    parentname: {
      type: String,
    },
    level: {
      type: Number,
    },
    fullpath: {
      type: String,
    },
    fullname: {
      type: String,
    },
    orderby: {
      type: Number,
    },
    createduser: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Area = mongoose.model("areas", areaSchema);
module.exports = Area;