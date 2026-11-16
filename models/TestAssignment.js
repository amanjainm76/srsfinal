
const mongoose = require("mongoose");

const testAssignmentSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestList",
      required: true,
      index: true
    },

    batches: [
      {
        batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Batch",
          required: true
        },
        studentCount: {
          type: Number,
          default: 0,
          min: 0
        },
        assignedOn: {
          type: Date,
          default: Date.now
        }
      }
    ],

    schedule: {
      useDefaultSchedule: {
        type: Boolean,
        default: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      solutionUnlockDate: {
        type: Date,
        required: true
      }
    },

    status: {
      type: String,
      enum: ["Assigned", "Cancelled"],
      default: "Assigned"
    },

    createdBy: {
      type: String,
      default: "super admin"
    },

    updatedBy: {
      type: String,
      default: "super admin"
    }
  },
  {
    timestamps: true
  }
);

// One assignment document per test
testAssignmentSchema.index({ test: 1 }, { unique: true });

module.exports = mongoose.model("TestAssignment", testAssignmentSchema);
