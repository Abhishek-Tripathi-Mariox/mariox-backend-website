const mongoose = require("mongoose");

// Declare empty schema
const CitiesSchema = new mongoose.Schema({}, { strict: false });

// Bind model to existing collection
const Cities = mongoose.model("cities", CitiesSchema, "cities");

module.exports = Cities;
