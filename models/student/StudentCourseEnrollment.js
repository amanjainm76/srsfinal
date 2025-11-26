const mongoose = require("mongoose");

// Student Course Enrollment Schema
const studentCourseEnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentRegistration",
    required: [true, "Student ID is required"],
  },
  studentRegistrationNumber: {
    type: String,
    required: [true, "Student registration number is required"],
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course ID is required"],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "suspended", "dropped"],
    default: "active",
  },
  progress: {
    completedChapters: [
      {
        subjectName: String,
        chapterNumber: Number,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedTopics: [
      {
        subjectName: String,
        chapterNumber: Number,
        topicTitle: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  enrolledBy: {
    type: String,
    default: "system",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
studentCourseEnrollmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Get formatted enrollment date
studentCourseEnrollmentSchema
  .virtual("formattedEnrollmentDate")
  .get(function () {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(this.enrollmentDate);
  });

// Ensure virtual fields are serialised
studentCourseEnrollmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(
  "StudentCourseEnrollment",
  studentCourseEnrollmentSchema
);
