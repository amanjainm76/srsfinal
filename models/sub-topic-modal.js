const mongoose = require("mongoose");

const subTopicSchema = new mongoose.Schema({
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
  
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },

  createdBy: {
    type: String,
    default: "superadmin",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: "superadmin",
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// ✅ FIXED MODEL NAME
const SubTopic = mongoose.model("SubTopic", subTopicSchema);

module.exports = SubTopic;