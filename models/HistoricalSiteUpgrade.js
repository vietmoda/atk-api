const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const upgradeSchema = new Schema(
  {
    //Nội dung thực hiện
    content: {
      type: String,
    },
    //Thời gian thực hiện, ghi text để lưu thông tin vì không phục vụ tính toán
    executetime: {
      type: String,
    },
    //Thông tin tổ chức hoặc cá nhân thực hiện
    executor: {
      type: String,
    },
    //Tổng kinh phí thực hiện cuối cùng sau khi hoàn thiện
    expense: {
      type: Number
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

const Upgrade = mongoose.model("historicalsiteupgrades", upgradeSchema);
module.exports = Upgrade;
