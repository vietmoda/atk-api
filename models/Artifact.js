const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artifactSchema = new Schema(
  {
    //Tên hiện vật
    name: {
      type: String,
    },
    //Tên gọi khác
    othername: {
      type: String,
    },
    //Nguồn gốc
    origin: {
      type: String,
    },
    //Chất liệu
    material: {
      type: String,
    },
    //Niên đại
    age: {
      type: String,
    },
    //Kích thước
    size: {
      type: String,
    },
    //Trọng lượng
    weight: {
      type: String,
    },
    //Thông tin
    infomation: {
      type: String,
    },
    //Đặt tại di tích ls nào
    historicalsiteid: {
      type: String,
    },
    createduser: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Artifact = mongoose.model("artifacts", artifactSchema);
module.exports = Artifact;
