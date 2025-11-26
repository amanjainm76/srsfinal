const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer", "essay"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswer: String,
  correctAnswers: [String],
  allowMultipleAnswers: {
    type: Boolean,
    default: false,
  },
  marks: {
    type: Number,
    required: true,
    default: 1,
  },
  explanation: String,
});

const studentTestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentRegistration",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    questions: [questionSchema],
    questionsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update questionsCount before saving
studentTestSchema.pre("save", function (next) {
  this.questionsCount = this.questions.length;
  next();
});

module.exports = mongoose.model("StudentTest", studentTestSchema);
