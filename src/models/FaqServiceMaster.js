const mongoose = require("mongoose");

// Declare empty schema
const FaqServiceMasterSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const FaqServiceMaster = mongoose.model(
  "faqServiceMaster",
  FaqServiceMasterSchema,
  "faqServiceMaster"
);

module.exports = FaqServiceMaster;
