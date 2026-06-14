const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  SRSUniqueCode: {
    type: Number,
    unique: true,
  },

  // ✅ STREAM
  stream: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "streams",
      required: true,
    },
    name: String,
    code: Number,
  },

  // ✅ SUBJECT
  subject: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
    },
    name: String,
    code: Number,
  },

  // ✅ UNIT
  unit: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InnerSubjectUnit",
      required: true,
    },
    name: String,
    code: Number,
  },

  // ✅ TOPIC
  topic: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    name: String,
    code: Number,
  },

  // ✅ SUBTOPIC (MULTIPLE)
  subTopics: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTopic",
      },
      name: String,
      code: Number,
    },
  ],

  // ✅ MAIN QUESTION
  enterQuestion: {
    type: String,
    required: true,
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
        required: true,
      },

      options: {
        type: [String],
        default: [],
      },

      correctAnswers: {
        type: [Number],
        default: [],
      },

      matrixAnswer: {
        type: Map,
        of: Boolean,
        default: null,
      },

      singleInteger: Number,
      fourDigit: Number,
      numericAnswerStartRange: Number,
      numericAnswerEndRange: Number,

      trueFalseAnswer: Boolean,

      subjectiveAnswerFormat: String,

      comprehensionText: [
        {
          subQuestionType: {
            type: String,
            enum: [
              "Comprehension SCQ",
              "Comprehension MCQ",
            ],
          },

          isActiveC: {
            type: Boolean,
            default: false,
          },

          enterQuestionC: {
            type: String,
            default: "",
          },

          optionsC: {
            type: [String],
            default: [],
          },

          correctAnswersC: {
            type: [Number],
            default: [],
          },

          urlC: {
            type: String,
            default: "",
          },

          hintsSolutionC: {
            type: String,
            default: "",
          },

          streamC: {
            type: [String],
            default: [],
          },

          subTopicC: {
            type: [String],
            default: [],
          },

          skillsC: {
            type: [String],
            default: [],
          },

          tagC: {
            type: [String],
            default: [],
          },

          levelC: {
            type: [String],
            default: [],
          },
        },
      ],
    },
  ],

  // ✅ META FIELDS
  url: String,
  hitsSolution: [String],

  skills: [String],
  tags: [String],
  level: [String],

  createdBy: {
    type: String,
    default: "super admin",
  },

  createdOn: String,

  updatedBy: {
    type: String,
    default: "super admin",
  },

  updatedOn: String,

  active: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("questions", questionSchema);
