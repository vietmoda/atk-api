const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    roleid: {
      type: String,
    },
    rolename: {
      type: String,
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

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;
