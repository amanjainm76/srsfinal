const mongoose = require("mongoose");

const subTopicSchema = new mongoose.Schema({
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
});
const SubTopic = mongoose.model("subtopics", subTopicSchema); // This is correct

module.exports = SubTopic;
