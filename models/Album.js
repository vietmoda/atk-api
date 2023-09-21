const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const albumSchema = new Schema(
  {
    imagename: {
      type: String,
    },
    description: {
      type: String,
    },
    categoryid: {
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

const Album = mongoose.model("albums", albumSchema);
module.exports = Album;
