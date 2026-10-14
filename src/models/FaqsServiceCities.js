const mongoose = require("mongoose");

// Declare empty schema
const SpecializationCityFAQsSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const SpecializationCityFAQs = mongoose.model(
  "SpecializationCityFAQs",
  SpecializationCityFAQsSchema,
  "SpecializationCityFAQs"
);

module.exports = SpecializationCityFAQs;
