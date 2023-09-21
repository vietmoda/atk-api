const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apiaccountSchema = new Schema(
  {
    apiurl: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
        type: String
    },
    status: {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

const ApiAccount = mongoose.model("ApiAccounts", apiaccountSchema);
module.exports = ApiAccount;
