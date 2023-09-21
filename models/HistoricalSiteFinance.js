const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financeSchema = new Schema(
  {
    //Nội dung như ai ủng hộ, công đức,...
    content: {
      type: String,
    },
    total: {
      type: Number,
    },
    //Ngày kiểm đếm
    datecheck: {
      type: Date,
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
