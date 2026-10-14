const mongoose = require("mongoose");

// Declare empty schema
const servicecitycompaniesSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const servicecitycompanies = mongoose.model(
  "servicecitycompanies",
  servicecitycompaniesSchema,
  "servicecitycompanies"
);

module.exports = servicecitycompanies;
