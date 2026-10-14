const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const InquireSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    slug: { type: String, required: true },
    specialization: { type: String, default: "" },
    city: { type: String, default: "" },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

var Inquire = mongoose.model("Inquire", InquireSchema);

module.exports = Inquire;
