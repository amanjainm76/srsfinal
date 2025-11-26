const mongoose = require("mongoose");

const testSeriesSchema = new mongoose.Schema({
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
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  stream: {
    type: [String],
    required: true,
  },
  maximumTest: {
    type: Number,
    required: true,
  },
  tags: {
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

const TestSeries = mongoose.model("testSeries", testSeriesSchema);

module.exports = TestSeries;
