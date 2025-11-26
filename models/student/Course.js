const mongoose = require("mongoose");

// Course Schema
const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
    unique: true,
  },
  courseDescription: {
    type: String,
    required: [true, "Course description is required"],
    trim: true,
  },
  courseImage: {
    type: String,
    default: "/assets/backend-img/default-course.png",
  },
  subjects: [
    {
      subjectName: {
        type: String,
        required: true,
        trim: true,
      },
      subjectImage: {
        type: String,
        default: "/assets/backend-img/default-subject.png",
      },
      chapters: [
        {
          chapterNumber: {
            type: Number,
            required: true,
          },
          chapterTitle: {
            type: String,
            required: true,
            trim: true,
          },
          chapterDescription: String,
          topics: [
            {
              topicTitle: {
                type: String,
                required: true,
                trim: true,
              },
              topicContent: {
                type: String,
                required: true,
              },
              videoId: String,
              pdfUrl: String,
              additionalResources: [
                {
                  resourceType: {
                    type: String,
                    enum: ["pdf", "video", "link", "image"],
                  },
                  resourceUrl: String,
                  resourceTitle: String,
                },
              ],
            },
          ],
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: "admin",
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
courseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Get formatted creation date
courseSchema.virtual("formattedCreatedAt").get(function () {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(this.createdAt);
});

// Ensure virtual fields are serialised
courseSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
