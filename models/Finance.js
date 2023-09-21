const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financeSchema = new Schema(
  {
    //tổng tiền sau kiểm đếm
    total: {
      type: Number,
    },
    description: {
      type: String,
    },
    //tính vào năm tài chính nào
    year: {
      type: Number,
    },
    historicalsiteid: {
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

const Finance = mongoose.model("finances", financeSchema);
module.exports = Finance;
