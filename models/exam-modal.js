const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  uniqueURL: {
    type: String, // Change to String if only a single URL is expected
    required: true,
  },
  description: {
    type: String, // Change to String for a single description
    required: true,
  },

markingScheme: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "markingSchemes",
      required: true,
    },
    name: String,
  },

  guildeline: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "guidelines",
      required: true,
    },
    name: String,
  },

  // markingScheme: {
  //   type: String,
  //   required: true,
  // },
  // guildeline: {
  //   type: String,
  //   required: true,
  // },


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
    default: true,
  },
});

const Exams = mongoose.model("Exams", examSchema);

module.exports = Exams;
