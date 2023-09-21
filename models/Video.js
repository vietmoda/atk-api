const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema(
    {
        videoname: {
            type: String,
        },
        description: {
            type: String,
        },
        //videourl: Neu khong upload len Server va dung link tu site khac
        videourl: {
            type: String
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

const Video = mongoose.model("videos", videoSchema);
module.exports = Video;
