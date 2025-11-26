const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
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
    required: true,
  },
  units: [
    {
      unitTitle: {
        type: String,
        required: true,
        enum: [
          "Physical Chemistry",
          "Organic Chemistry",
          "Inorganic Chemistry",
          "Algebra",
          "Calculus",
          "Coordinate Geometry",
          "Trigonometry",
          "Wave Optics",
          "Ray Optics",
          "Wave Oscillation",
          "Social Science VIII",
          "Fluid Mechanics and Properties of Matter",
          "Physics VIII",
          "Mental Ability VIII",
          "Biology VIII",
          "General Knowledge Class IX",
          "Element of Business Class IX",
          "Mathematics Class IX",
          "Mathematics Class X",
          "Element of Business Class X",
          "General Knowledge Class X",
          "Mathematics Class VIII",
          "Chemistry Class IX",
          "Chemistry Class X",
          "Electromagnetism",
          "Chemistry Class VIII",
          "Zoology",
          "Botany",
          "Heat and Thermodynamics",
          "Electronics EM Waves and Communication",
          "Mechanics",
          "Modern Physics",
          "Physics Class IX",
          "Physics Class X",
          "Mental Ability Class IX",
          "Mental Ability Class X",
          "Biology Class IX",
          "Biology Class X",
          "Social Science IX",
          "Social Science X",
          "English Class IX",
          "English Class X",
          "English Class VIII",
          "General Knowledge VIII",
          "Elements of Book Keeping and Accountancy Class IX",
          "Elements of Book Keeping and Accountancy Class X",
          "Accounts",
          "Business Studies",
          "Economics",
          "Legal Studies",
        ],
      },
      subTopics: [
        {
          subTitle: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  createdBy: {
    type: String,
    required: true,
    default: "superadmin",
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "superadmin",
  },
  updatedOn: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
  SubTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: "subtopics" }], // Reference to the SubTopic model
});

const Topic = mongoose.model("topics", topicSchema);

module.exports = Topic;
