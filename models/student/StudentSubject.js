const mongoose = require("mongoose");

const studentSubjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentRegistration",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("StudentSubject", studentSubjectSchema);
