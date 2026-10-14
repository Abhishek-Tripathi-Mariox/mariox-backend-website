const mongoose = require("mongoose");

// Declare empty schema
const FaqServiceCityMasterSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const FaqServiceCityMaster = mongoose.model(
  "faqServiceCityMaster",
  FaqServiceCityMasterSchema,
  "faqServiceCityMaster"
);

module.exports = FaqServiceCityMaster;
