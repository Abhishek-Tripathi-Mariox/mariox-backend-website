const mongoose = require("mongoose");

// Declare empty schema
const serviceCitiesSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const serviceCities = mongoose.model(
  "serviceCities",
  serviceCitiesSchema,
  "serviceCities"
);

module.exports = serviceCities;
