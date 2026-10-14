const mongoose = require("mongoose");

// Declare empty schema
const ServiceImagesSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const ServiceImages = mongoose.model(
  "serviceimages",
  ServiceImagesSchema,
  "serviceimages"
);

module.exports = ServiceImages;
