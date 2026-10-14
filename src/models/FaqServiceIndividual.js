const mongoose = require("mongoose");

// Declare empty schema
const FaqServiceIndividualSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const FaqServiceIndividual = mongoose.model(
  "faqServiceIndividual",
  FaqServiceIndividualSchema,
  "faqServiceIndividual"
);

module.exports = FaqServiceIndividual;
