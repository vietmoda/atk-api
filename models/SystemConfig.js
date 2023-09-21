const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const systemconfigSchema = new Schema(
  {
    configkey: {
      type: String,
    },
    configvalue: {
      type: String,
    },
    status: {
      type: Number
    },
    createduser: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const SystemCongif = mongoose.model("systemcongifs", systemconfigSchema);
module.exports = SystemCongif;
