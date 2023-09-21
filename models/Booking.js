const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        visitername: {
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
        totalmember: {
            type: String,
        },                 
        leaderinfo: {
            type: String
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

const Booking = mongoose.model("bookings", bookingSchema);
module.exports = Booking;
