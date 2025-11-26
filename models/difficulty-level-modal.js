const mongoose = require("mongoose");
const difficultyLevelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
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
const DifficultyLevel = mongoose.model(
  "DifficultyLevels",
  difficultyLevelSchema
);

module.exports = DifficultyLevel;
