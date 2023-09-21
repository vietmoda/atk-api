const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ordermenuSchema = new Schema(
    {
        fullname: {
            type: String,
        },
        address: {
            type: String,
        },
        telephone: {
            type: String,
        },
        email: {
            type: String,
        },        
        totaldiners: {
            type: String,
        },
        visitdate: {
            type: Date
        },
        visithour: {
            type: String
        },        
        content: {
            type: String
        },
        processstatus: {
            type: Number,
        },
        processinfo: {
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

const OrderMenu = mongoose.model("ordermenus", ordermenuSchema);
module.exports = OrderMenu;
