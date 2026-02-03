const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
    trim: true,
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Center",
    required: true,
  },
  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "streams",
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
