const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryname: {
      type: String,
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

const Category = mongoose.model("categories", categorySchema);
module.exports = Category;
