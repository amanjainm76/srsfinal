const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  SRSUniqueCode: {
    type: Number,
    unique: true, // Ensuring uniqueness
  },

  subjectType: {
    type: [String],
    default: [], // Default empty array if not provided
  },
  enterQuestion: {
    type: [String],
    default: [], // Default empty array if not provided
  },
  questions: [
    {
      questionType: {
        type: String,
        enum: [
          "Multiple Correct",
          "Single Correct",
          "Comprehension SCQ",
          "Comprehension MCQ",
          "Single Digit Integer",
          "Four Digit Integer",
          "Numeric Value",
          "Matrix 4*5",
          "Matrix 4*6",
          "Matrix 3*4",
          "Assertion Reasoning",
          "Matrix Single Correct",
          "Comprehension",
          "True False",
          "Subjective",
        ],
      },

      options: {
        type: [String],
        default: [], // Default empty array if not provided
      },

      correctAnswers: {
        type: [Number],
        default: [], // Default empty array if not provided
      },

      assertionAnswer: {
        type: String,
        default: null, // Default null if not provided
      },

      reasoningAnswer: {
        type: String,
        default: null, // Default null if not provided
      },

      matrixAnswer: {
        type: Map,
        of: Boolean,
        default: null, // Default null if not provided
      },

      numericAnswer: {
        type: Number,
        default: null, // Default null if not provided
      },

      singleInteger: {
        type: Number,
        default: null, // Default null if not provided
      },

      fourDigit: {
        type: Number,
        default: null, // Default null if not provided
      },

      numericAnswerStartRange: {
        type: Number,
        default: null, // Default null if not provided
      },

      numericAnswerEndRange: {
        type: Number,
        default: null, // Default null if not provided
      },

      trueFalseAnswer: {
        type: Boolean,
        default: null, // Default null if not provided
      },

      questionContent: {
        type: String,
        default: null, // Default null if not provided
      },

      subjectiveAnswerFormat: {
        type: String,
        default: null, // Default null if not provided
      },

      comprehensionText: {
        subQuestionType: {
          type: [String],
          default: [],
        },
        isActiveC: {
          type: Boolean,
          default: false, // Default false if not provided
        },
        enterQuestionC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        correctAnswersC: {
          type: [Number],
          default: [], // Default empty array if not provided
        },
        optionsC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        urlC: {
          type: String,
          default: null, // Default null if not provided
        },
        hintsSolutionC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        streamC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        subTopicC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        skillsC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        tagC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
        levelC: {
          type: [String],
          default: [], // Default empty array if not provided
        },
      },
    },
  ],

  url: {
    type: String,
    default: null, // Default null if not provided
  },

  hitsSolution: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  stream: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  subTopic: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  skills: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  tags: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  level: {
    type: [String],
    default: [], // Default empty array if not provided
  },

  createdBy: {
    type: String,
    required: true,
    default: "super admin", // Default value
  },

  createdOn: {
    type: String,
    required: true,
  },

  updatedBy: {
    type: String,
    required: true,
    default: "super admin", // Default value
  },

  updatedOn: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    required: true, // Make active field required
  },
});

const Question = mongoose.model("questions", questionSchema);

module.exports = Question;
