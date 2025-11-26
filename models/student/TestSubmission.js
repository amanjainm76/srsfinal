const mongoose = require("mongoose");

const testSubmissionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTest",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentRegistration",
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isEvaluated: {
      type: Boolean,
      default: false, // For essay/short-answer questions
    },
    teacherRemarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
testSubmissionSchema.index({ studentId: 1, testId: 1 });

module.exports = mongoose.model("TestSubmission", testSubmissionSchema);
