const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  uniqueURL: {
    type: String, // Change to String if only a single URL is expected
    required: true,
  },
  description: {
    type: String, // Change to String for a single description
    required: true,
  },
  markingScheme: {
    type: String, // Change to String for a single value
    required: true,
  },
  guildeline: {
    type: String, // Change to String for a single value
    required: true,
  },
  stream: {
    type: String, // Change to String for a single value
    required: true,
  },

  createdBy: {
    type: String,
    required: true,
    default: "super admin",
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "super admin",
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true, // Set default to true for new exams
  },
});

const Exams = mongoose.model("Exams", examSchema);

module.exports = Exams;
