const mongoose = require("mongoose");

// Declare empty schema
const FaqServiceCityIndividualSchema = new mongoose.Schema(
  {},
  { strict: false }
);

// Bind model to existing collection
const Cities = mongoose.model(
  "faqServiceCityIndividual",
  FaqServiceCityIndividualSchema,
  "faqServiceCityIndividual"
);

module.exports = Cities;
