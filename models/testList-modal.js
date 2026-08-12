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
    type: String,
    default: "",
  },

  // Exam Type - Multiple
  examType: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },
    },
  ],

  // Test Type - Single
  testType: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
  },

  // Test Instructions - ReactQuill HTML
  testInstructions: {
    type: String,
    default: "",
  },

  // Maximum Questions
  maxQuestions: {
    type: Number,
    required: true,
  },

  // Duration
  duration: {
    type: Number,
    required: true,
  },

  // Guidelines - Multiple
  guideline: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },
    },
  ],

  // Marking Scheme - Multiple
  markingScheme: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },
    },
  ],

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

  // Tags - Multiple
  tags: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },
    },
  ],

  isActiveHasSection: {
    type: Boolean,
    default: false,
  },

  // Sections
  sections: [
    {
      sectionName: {
        type: String,
        default: "",
      },

      sectionDescription: {
        type: String,
        default: "",
      },

      sectionDisplayOrder: {
        type: Number,
      },

      sectionMaximumQuestions: {
        type: Number,
      },

      // Section Guidelines
      sectionGuideline: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },

          title: {
            type: String,
            required: true,
          },
        },
      ],

      // Section Marking Scheme
      sectionMarkingScheme: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },

          title: {
            type: String,
            required: true,
          },
        },
      ],

      questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions",
      },
    ],

      isActiveSection: {
        type: Boolean,
        default: false,
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
    default: false,
  },
});

const TestList = mongoose.model("TestList", testListSchema);

module.exports = TestList;
