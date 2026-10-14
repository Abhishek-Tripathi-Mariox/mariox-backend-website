const mongoose = require("mongoose");

// Declare empty schema
const servicePagesSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const ServicePages = mongoose.model(
  "servicePages",
  servicePagesSchema,
  "servicePages"
);

module.exports = ServicePages;
