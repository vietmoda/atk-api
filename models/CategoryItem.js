const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryitemSchema = new Schema(
  {
    itemname: {
      type: String,
    },
    categoryid: {
      type: String,
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

const CategoryItem = mongoose.model("categoryitems", categoryitemSchema);
module.exports = CategoryItem;
