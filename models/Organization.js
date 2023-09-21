const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const organizationSchema = new Schema(
  {
    orgcode: {
      type: String,
    },
    orgname: {
      type: String,
    },
    logo: {
      type: String,
    },
    parentid: {
      type: String,
    },
    orglevel: {
      type: Number,
    },
    fullpath: {
      type: String,
    },
    orgtype: {
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

/*
orgtype: _id in CategoryItem
*/

const Organization = mongoose.model("organizations", organizationSchema);
module.exports = Organization;