const mongoose = require("mongoose");

const skillsSchema = new mongoose.Schema({
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
  },
});

const Skills = mongoose.model("skills", skillsSchema);

module.exports = Skills;
