const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const festivalSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    historicalsiteid: {
        type: String
    },
    status: {
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

const Festival = mongoose.model("festivals", festivalSchema);
module.exports = Festival;
