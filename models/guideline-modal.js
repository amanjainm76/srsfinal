const mongoose = require("mongoose");
const guidelineSchema = new mongoose.Schema({
  title: {
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
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
});
const guideline = mongoose.model("guidelines", guidelineSchema);

module.exports = guideline;
