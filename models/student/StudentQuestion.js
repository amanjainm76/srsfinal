const mongoose = require("mongoose");

const studentQuestionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentRegistration",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["multiple-choice", "fill-in-blank", "descriptive"],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
    },
    explanation: {
      type: String,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentSubject",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentChapter",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTopic",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    marks: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudentQuestion", studentQuestionSchema);
