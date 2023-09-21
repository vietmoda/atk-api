const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weblinkSchema = new Schema(
    {
        linkname: {
            type: String,
        },
        linkurl: {
            type: String,
        },
        //Su dung de xem link nao hien thi dang dropdown, link nao the hien dang banner anh
        viewtype: {
            type: String,
        }, 
        //Thuoc chuyen muc nao, dung de gom nhom cac weblink       
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

const Weblink = mongoose.model("weblinks", weblinkSchema);
module.exports = Weblink;
