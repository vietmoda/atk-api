const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*Không sử dụng bảng trung gian quan hệ n-n, sử dụng trường listroleid: để lưu các role trong group*/
const groupSchema = new Schema(
  {
    groupname: {
      type: String,
    },
    listroleid: {
      type: Array,
    },
    status: {
      type: Number,
    },
    createduser: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("groups", groupSchema);
module.exports = Group;

/*
listroleid: list of _id in Role collection, exp: ,21,bn3,c5,
*/
