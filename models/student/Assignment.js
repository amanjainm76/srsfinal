const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    // Basic Assignment Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Subject Details
    subject: {
      type: String,
      required: true,
      enum: ["Physics", "Chemistry", "Mathematics"],
    },
    subjectId: {
      type: Number,
      required: true,
      enum: [1, 2, 3], // 1=Physics, 2=Chemistry, 3=Mathematics
    },

    // Dates
    assignedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastDate: {
      type: Date,
      required: true,
    },

    // Assignment Details
    status: {
      type: String,
      enum: ["pending", "in-progress", "submitted", "overdue"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    instructor: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Additional Fields
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    estimatedTime: {
      type: String,
      default: "2-4 hours",
    },
    topic: {
      type: String,
      required: true,
    },

    // NEW MISSING FIELDS
    // Assignment Resources
    resourceFiles: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        filePath: String, // Server file path
        fileUrl: String, // Public URL if using cloud storage
      },
    ],

    // Assignment Instructions & Requirements
    instructions: {
      type: String,
      default: "",
    },
    requirements: [
      {
        type: String,
      },
    ],

    // File Upload Settings
    allowedFileTypes: [
      {
        type: String,
        default: ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"],
      },
    ],
    maxFileSize: {
      type: Number,
      default: 10485760, // 10MB in bytes
    },

    // Assignment Category & Tags
    category: {
      type: String,
      enum: ["Theory", "Practical", "Lab", "Project", "Research"],
      default: "Theory",
    },
    tags: [
      {
        type: String,
      },
    ],

    // Student Assignment Relationship
    assignedTo: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentRegistration",
          required: true,
        },
        submissionStatus: {
          type: String,
          enum: [
            "not-started",
            "in-progress",
            "submitted",
            "graded",
            "overdue",
          ],
          default: "not-started",
        },
        submissionDate: {
          type: Date,
        },
        submissionFile: {
          type: String,
        },
        submissionFileDetails: {
          filename: String,
          originalName: String,
          mimetype: String,
          size: Number,
        },
        grade: {
          type: Number,
          min: 0,
          max: 100,
        },
        feedback: {
          type: String,
        },
        submissionNotes: {
          type: String,
        },
        lateSubmission: {
          type: Boolean,
          default: false,
        },
        submissionHistory: [
          {
            action: {
              type: String,
              // FIX: Add "assigned" to enum values
              enum: [
                "assigned",
                "submitted",
                "resubmitted",
                "graded",
                "feedback_added",
                "status_updated",
              ],
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
            notes: String,
            performedBy: String,
          },
        ],
      },
    ],

    // Assignment Statistics
    statistics: {
      totalAssigned: {
        type: Number,
        default: 0,
      },
      totalSubmitted: {
        type: Number,
        default: 0,
      },
      totalGraded: {
        type: Number,
        default: 0,
      },
      averageGrade: {
        type: Number,
        default: 0,
      },
      submissionRate: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "System",
    },
    lastModifiedBy: {
      type: String,
    },
    lastModifiedDate: {
      type: Date,
    },

    // NEW IMPORTANT FIELDS
    // Assignment Settings
    settings: {
      allowLateSubmission: {
        type: Boolean,
        default: false,
      },
      lateSubmissionPenalty: {
        type: Number, // Percentage penalty per day
        default: 0,
      },
      maxSubmissionAttempts: {
        type: Number,
        default: 1,
      },
      showGradeToStudent: {
        type: Boolean,
        default: true,
      },
      autoGrade: {
        type: Boolean,
        default: false,
      },
    },

    // Version Control
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: [
      {
        version: Number,
        changes: String,
        modifiedBy: String,
        modifiedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Fields
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.lastDate && this.status !== "submitted";
});

assignmentSchema.virtual("daysRemaining").get(function () {
  const today = new Date();
  const lastDate = new Date(this.lastDate);
  const diffTime = lastDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update statistics
assignmentSchema.pre("save", function (next) {
  if (this.isModified("assignedTo")) {
    this.statistics.totalAssigned = this.assignedTo.length;
    this.statistics.totalSubmitted = this.assignedTo.filter(
      a => a.submissionStatus === "submitted" || a.submissionStatus === "graded"
    ).length;
    this.statistics.totalGraded = this.assignedTo.filter(
      a => a.submissionStatus === "graded"
    ).length;

    // Calculate submission rate
    if (this.statistics.totalAssigned > 0) {
      this.statistics.submissionRate =
        (this.statistics.totalSubmitted / this.statistics.totalAssigned) * 100;
    }

    // Calculate average grade
    const gradedAssignments = this.assignedTo.filter(
      a => a.grade !== undefined && a.grade !== null
    );
    if (gradedAssignments.length > 0) {
      const totalGrades = gradedAssignments.reduce(
        (sum, a) => sum + a.grade,
        0
      );
      this.statistics.averageGrade = totalGrades / gradedAssignments.length;
    }
  }
  next();
});

// Method to add submission history
assignmentSchema.methods.addSubmissionHistory = function (
  studentId,
  action,
  notes,
  performedBy
) {
  const studentAssignment = this.assignedTo.find(
    a => a.studentId.toString() === studentId.toString()
  );
  if (studentAssignment) {
    studentAssignment.submissionHistory.push({
      action,
      notes,
      performedBy,
      timestamp: new Date(),
    });
  }
};

// Method to check if assignment is overdue for a student
assignmentSchema.methods.isOverdueForStudent = function (studentId) {
  const studentAssignment = this.assignedTo.find(
    a => a.studentId.toString() === studentId.toString()
  );
  if (!studentAssignment) return false;

  const now = new Date();
  const isOverdue = now > this.lastDate;
  const notSubmitted =
    studentAssignment.submissionStatus !== "submitted" &&
    studentAssignment.submissionStatus !== "graded";

  return isOverdue && notSubmitted;
};

// Indexes for better performance
assignmentSchema.index({ subject: 1, subjectId: 1 });
assignmentSchema.index({ "assignedTo.studentId": 1 });
assignmentSchema.index({ status: 1, priority: 1 });
assignmentSchema.index({ lastDate: 1 });
assignmentSchema.index({ isActive: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ "assignedTo.submissionStatus": 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
