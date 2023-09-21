const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    title: {
      type: String,
    },    
    description: {
      type: String,
    },
    newsbody: {
      type: String
    },
    //Một tin cho phép đưa vào nhiều chuyên mục
    listcategoryid: {
      type: Array,
    },
    keywords: {
      type: String
    },
    //status's news
    newsstatus: {
      type: Number,
    },
    //Ngày xuất bản
    publishdate: {
      type: Date,
    },
    //Tác giả
    author: {
      type: String
    },
    //Nguồn tin: nếu trích dẫn lại từ nơi khác
    source: {
      type: String
    },
    visited: {
      type: Number,
    },
    status: {
      type: Number,
    },
    createduser: {
      type: String,
    },
    verifieduser: {
      type: String,
    },
    publisheduser: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("news", newsSchema);
module.exports = News;
