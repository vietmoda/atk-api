const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newscategorySchema = new Schema(
  {
    newscategoryname: {
      type: String,
    },
    newscategorytype: {
      type: String
    },
    parentid: {
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

const NewsCategory = mongoose.model("newscategories", newscategorySchema);
module.exports = NewsCategory;
