const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  content: {
    type: [String],
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    default: "super admin", // Default value
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "super admin", // Default value
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
});

const Stream = mongoose.model("streams", streamSchema);

module.exports = Stream;
