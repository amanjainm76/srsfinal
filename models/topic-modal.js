const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "streams",
    required: true,
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },

  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InnerSubjectUnit",
    required: true
  },

  createdBy: {
    type: String,
    default: "superadmin",
  },

  createdOn: {
    type: String,
    required: true,
  },

  updatedBy: {
    type: String,
    default: "superadmin",
  },

  updatedOn: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    default: true,
  },
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;