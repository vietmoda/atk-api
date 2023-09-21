const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    position: {
      type: String,
    },
    telephone: {
      type: String,
    },
    organizationid: {
      type: String,
    },
    status: {
      type: Number,
    },
    usertype: {
      type: String,
    },
    roleid: {
      type: Array,      
    },
    grouproleid: {
      type: Array,
    },
    lastchangepassword: {
      type: Date,
    },
    createduser: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", userSchema);
module.exports = User;

/*
grouproleid/roleid: ,1,2,12,
usertype: admin, user, guest
organizationid: _id in Organization collection
*/
