// models/StudyMaterialModel.js
const mongoose = require("mongoose");

const StudyMaterialSchema = new mongoose.Schema(
  {
    // Material Type (Tab categories)
    materialType: {
      type: String,
      required: [true, "Material type is required"],
      enum: {
        values: [
          "study-material",
          "exercise",
          "race",
          "special-booklet",
          "class-notes",
        ],
        message: "{VALUE} is not a valid material type",
      },
      index: true,
    },

    // Course (for filtering by student enrollment)
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // Subject
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: [
        "physics",
        "chemistry",
        "botany",
        "zoology",
        "mathematics",
        "science",
        "biology",
      ],
      index: true,
    },

    // Topic
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      maxlength: [200, "Topic name cannot exceed 200 characters"],
    },

    // Material Title (Main display name)
    title: {
      type: String,
      required: [true, "Material title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },

    // Description (Optional)
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // File Information
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },

    fileName: {
      type: String,
      required: [true, "File name is required"],
    },

    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      max: [10485760, "File size cannot exceed 10MB"],
    },

    // Upload Information
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registers",
      required: true,
    },

    uploadedOn: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Last accessed
    lastAccessedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
StudyMaterialSchema.index({ course: 1, materialType: 1 });
StudyMaterialSchema.index({ subject: 1, topic: 1 });
StudyMaterialSchema.index({ uploadedOn: -1 });
StudyMaterialSchema.index({ title: "text", description: "text" }); // Text search

// Virtual for file size in MB
StudyMaterialSchema.virtual("fileSizeMB").get(function () {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Pre-save hook to update lastAccessedOn
StudyMaterialSchema.pre("save", function (next) {
  if (this.isModified("viewCount") || this.isModified("downloadCount")) {
    this.lastAccessedOn = new Date();
  }
  next();
});

module.exports = mongoose.model("StudyMaterial", StudyMaterialSchema);
