const mongoose = require("mongoose");

// Declare empty schema
const ServiceCityImageSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const ServiceCityImage = mongoose.model(
  "servicecityimages",
  ServiceCityImageSchema,
  "servicecityimages"
);

module.exports = ServiceCityImage;
