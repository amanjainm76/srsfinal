const mongoose = require("mongoose");

const testListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  content: {
    type: [String],
  },
  examType: {
    type: [String],
    required: true,
  },
  testType: [
    {
      testType: {
        type: [String],
      },
      subTopic: {
        type: [String],
      },
      subjectsData: {
        type: [String],
      },
      syllabus: {
        type: [String],
      },
      topic: {
        type: [String],
      },
      unit: {
        type: [String],
      },
    },
  ],
  maxQuestions: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  guideline: {
    type: [String],
    required: true,
  },
  markingScheme: {
    type: [String],
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  solutionUnlockDate: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // Ensure the field name matches the client-side
    required: true,
  },
  isActiveHasSection: {
    type: Boolean,
  },
  sections: [
    {
      sectionName: {
        type: String,
      },
      sectionDescription: {
        type: String,
      },
      sectionDisplayOrder: {
        type: Number,
      },
      sectionGuideline: {
        type: [String],
      },
      sectionMarkingScheme: {
        type: [String],
      },
      isActiveSection: {
        type: Boolean,
      },
    },
  ],
  createdBy: {
    type: String,
    required: true,
    default: "super admin",
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "super admin",
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  select: {
    type: Boolean,
    default: false, // By default, set 'select' to false
  },
});

const TestList = mongoose.model("TestList", testListSchema);

module.exports = TestList;
