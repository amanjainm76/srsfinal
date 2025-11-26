const mongoose = require("mongoose");

const innerSubjectUnitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  content: {
    type: [String], // Should be an array of strings
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    default: "superadmin", // Default value, adjust if needed
  },
  createdOn: {
    type: Date, // Changed to Date type
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "superadmin", // Default value, adjust if needed
  },
  updatedOn: {
    type: Date, // Changed to Date type
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true, // Default value to ensure boolean
  },
});

const InnerSubjectUnit = mongoose.model(
  "InnerSubjectUnit",
  innerSubjectUnitSchema
);

module.exports = InnerSubjectUnit;
