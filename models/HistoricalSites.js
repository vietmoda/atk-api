const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historicalsiteSchema = new Schema(
  {
    name: {
      type: String,
    },
    introduce: {
      type: String,
    },
    areaid: {
      type: String,
    },
    areadetail: {
      type: String,
    },
    latlong: {
      type: String,
    },
    //Thông tin về danh nhân văn hóa, lịch sử tôn giáo gắn với di tích lịch sử
    greatpeople: {
      type: String,
    },
    //Đường link tới dữ liệu thực tế ảo (view sẽ nhúng iframe)
    vrlink: {
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

/*
Ngoài các thông tin chung ra, điểm DTLS còn các dữ liệu khác như:
- Thông tin hiện vật
- Upgrate: Thông tin quá trình tủ bổ, tôn tạo (Nội dung thực hiện, thời gian, kinh phí, đơn vị thực hiện tôn tạo,...)
- Festival: Sự kiện, lễ hội diễn ra tại hoặc liên quan tới DTLS
- Finance: Dữ liệu tổng tiền công đức, ủng hộ, tài trợ cho DTLS
- File audio thuyết minh => Trong collection files
- File tư liệu (bản scan các giấy tờ) => Trong collection files
- Hình ảnh => Trong collection files
*/

const HistoricalSite = mongoose.model("historicalsites", historicalsiteSchema);
module.exports = HistoricalSite;
