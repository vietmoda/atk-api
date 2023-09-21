const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const suggestedmenuSchema = new Schema(
    {
        menuname: {
            type: String,
        },
        numberdiners: {
            type: Number,
        },
        price: {
            type: String,
        },
        listfood: {
            type: Array
        },  
        note: {
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

const SuggestedMenu = mongoose.model("suggestedmenus", suggestedmenuSchema);
module.exports = SuggestedMenu;
