const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
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
  stream: {
    type: [String],
    enum: ["Commerce", "Medical", "Foundation", "Engineering"], // Allow multiple streams
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    default: "superadmin", // Default value, adjust if needed
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "superadmin", // Default value, adjust if needed
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
  innerSubjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "InnerSubjectUnit" },
  ], // Reference to the InnerSubjectUnit model
});

const Subject = mongoose.model("subjects", subjectSchema);

module.exports = Subject;
