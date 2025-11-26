const mongoose = require("mongoose");

const markingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: [String],
    required: true,
  },
  isPartialMarking: {
    type: Boolean,
  },
  questions: [
    {
      questionType: {
        type: String,
        enum: [
          "Multiple Correct",
          "Single Correct",
          "Comprehension SCQ",
          "Comprehension MCQ",
          "Single Digit Integer",
          "Four Digit Integer",
          "Numeric Value",
          "Matrix 4*5",
          "Matrix 4*6",
          "Matrix 3*4",
          "Assertion Reasoning",
          "Matrix Single Correct",
          "Comprehension",
          "True False",
          "Subjective",
        ],
        required: true,
      },
      marks: {
        type: Map,
        of: Number,
        required: true, // marks like rightMarks, wrongMarks, etc.
      },
      partialMarks: {
        type: Map,
        of: Number, // partial marks like singleRightMarks, etc.
      },
    },
  ],
  createdBy: {
    type: String,
    required: true,
    default: "superadmin",
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "superadmin",
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
});

const MarkingSchemes = mongoose.model("markingSchemes", markingSchema);

module.exports = MarkingSchemes;
