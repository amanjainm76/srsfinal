
const mongoose = require("mongoose");

const TestList = require("../models/testList-modal");
const Batch = require("../models/batch-model");
const Center = require("../models/center-model");
const StudentRegistration = require("../models/StudentRegistration");
const TestAssignment = require("../models/TestAssignment");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

// Convert date string / Date into valid Date
const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// --------------------------------------------------
// CALCULATE TEST STATUS
// Priority: Assigned > Ready > Draft
// --------------------------------------------------

const calculateTestStatus = async (testId) => {
  const test = await TestList.findById(testId)
    .select("maxQuestions sections")
    .lean();

  if (!test) return null;

  // Check if test is already assigned to at least one batch
  const assignment = await TestAssignment.findOne({
    test: testId,
    status: "Assigned",
    "batches.0": { $exists: true },
  })
    .select("_id")
    .lean();

  if (assignment) return "Assigned";

  // Count questions from all sections
  const sections = Array.isArray(test.sections)
    ? test.sections
    : [];

  const totalAddedQuestions = sections.reduce(
    (total, section) => {
      const questions = Array.isArray(section.questions)
        ? section.questions
        : [];

      return total + questions.length;
    },
    0
  );

  const requiredQuestions = Number(test.maxQuestions || 0);

  if (
    requiredQuestions > 0 &&
    totalAddedQuestions >= requiredQuestions
  ) {
    return "Ready";
  }

  return "Draft";
};

// --------------------------------------------------
// UPDATE TEST STATUS IN DATABASE
// --------------------------------------------------

const updateTestStatus = async (testId) => {
  const status = await calculateTestStatus(testId);

  if (!status) return null;

  await TestList.updateOne(
    { _id: testId },
    {
      $set: { status },
    }
  );

  return status;
};

// --------------------------------------------------
// GET TEST DETAILS
// --------------------------------------------------

exports.getTestForAssignment = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    // Calculate latest status
    const latestStatus = await updateTestStatus(testId);

    const test = await TestList.findById(testId)
      .select(
        "title examType testType maxQuestions duration startDate endDate solutionUnlockDate active status"
      )
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Ensure response has latest status
    test.status = latestStatus;

    const assignment = await TestAssignment.findOne({
      test: testId,
    })
      .populate("batches.batch", "batchName")
      .lean();

    return res.json({
      success: true,
      data: {
        test,
        assignment,
      },
    });
  } catch (error) {
    console.error("getTestForAssignment:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch test details",
    });
  }
};

// --------------------------------------------------
// GET CENTER LIST
// --------------------------------------------------

exports.getAssignmentCenters = async (req, res) => {
  try {
    const centers = await Center.find({})
      .select("_id centerName")
      .sort({ centerName: 1 })
      .lean();

    return res.json({
      success: true,
      data: centers,
    });
  } catch (error) {
    console.error("getAssignmentCenters:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch centers",
    });
  }
};

// --------------------------------------------------
// GET BATCHES WITH FILTERS
// --------------------------------------------------

exports.getBatchesForAssignment = async (req, res) => {
  try {
    const { testId } = req.params;

    const {
      search = "",
      center = "",
      status = "",
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    const filter = {};

    if (search.trim()) {
      // Escape special regex characters
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.batchName = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    if (center && mongoose.Types.ObjectId.isValid(center)) {
      filter.center = new mongoose.Types.ObjectId(center);
    }

    if (status === "active") {
      filter.active = true;
    } else if (status === "inactive") {
      filter.active = false;
    }

    const [
      batches,
      studentCounts,
      assignment,
    ] = await Promise.all([
      Batch.find(filter)
        .select("_id batchName center active")
        .populate("center", "centerName")
        .sort({ batchName: 1 })
        .lean(),

      StudentRegistration.aggregate([
        {
          $match: {
            status: "active",
            batch: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$batch",
            totalStudents: { $sum: 1 },
          },
        },
      ]),

      TestAssignment.findOne({
        test: testId,
        status: "Assigned",
      })
        .select("batches")
        .lean(),
    ]);

    const countMap = new Map(
      studentCounts.map((item) => [
        String(item._id),
        item.totalStudents,
      ])
    );

    const assignedMap = new Map(
      (assignment?.batches || []).map((item) => [
        String(item.batch),
        item.studentCount,
      ])
    );

    const result = batches.map((batch) => ({
      _id: batch._id,
      batchName: batch.batchName,
      centerId: batch.center?._id || null,
      centerName: batch.center?.centerName || "N/A",
      totalStudents: countMap.get(String(batch._id)) || 0,
      active: batch.active,
      alreadyAssigned: assignedMap.has(String(batch._id)),
    }));

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getBatchesForAssignment:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch batches",
    });
  }
};

// --------------------------------------------------
// SAVE / UPDATE TEST ASSIGNMENT
// --------------------------------------------------

exports.saveTestAssignment = async (req, res) => {
  try {
    const { testId, batchIds, schedule } = req.body;

    // 1. Validate test ID
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID",
      });
    }

    // 2. Validate batchIds
    if (!Array.isArray(batchIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch selection",
      });
    }

    // 3. Remove duplicate batch IDs
    const validBatchIds = [
      ...new Set(batchIds.map(String)),
    ];

    // 4. Validate batch IDs
    if (
      !validBatchIds.every((id) =>
        mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more batch IDs are invalid",
      });
    }

    // 5. Fetch test details
    const test = await TestList.findById(testId)
      .select(
        "startDate endDate solutionUnlockDate maxQuestions sections"
      )
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // 6. Calculate latest test status
    const currentStatus = await calculateTestStatus(testId);

    // Only Ready or already Assigned tests can be assigned
    if (!["Ready", "Assigned"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `This test is ${currentStatus || "Draft"}. Only Ready tests can be assigned.`,
        status: currentStatus || "Draft",
      });
    }

    // 7. If no batches selected, delete assignment
    if (validBatchIds.length === 0) {
      const deletedAssignment = await TestAssignment.findOneAndDelete({
        test: testId,
      });

      // Recalculate status after removing assignment
      const updatedStatus = await updateTestStatus(testId);

      return res.json({
        success: true,
        message: deletedAssignment
          ? "Complete test assignment deleted successfully"
          : "No existing assignment found",
        data: null,
        status: updatedStatus,
      });
    }

    // 8. Schedule handling
    const useDefaultSchedule =
      schedule?.useDefaultSchedule === true;

    const startDate = parseDate(
      useDefaultSchedule
        ? test.startDate
        : schedule?.startDate
    );

    const endDate = parseDate(
      useDefaultSchedule
        ? test.endDate
        : schedule?.endDate
    );

    const solutionUnlockDate = parseDate(
      useDefaultSchedule
        ? test.solutionUnlockDate
        : schedule?.solutionUnlockDate
    );

    if (!startDate || !endDate || !solutionUnlockDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all valid schedule dates",
      });
    }

    // Same start and end date/time is allowed
    // Only reject if end date is earlier than start date
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after start date",
      });
    }

    if (solutionUnlockDate < endDate) {
      return res.status(400).json({
        success: false,
        message: "Solution unlock date must be on or after end date",
      });
    }

    // 9. Fetch selected active batches
    const batches = await Batch.find({
      _id: { $in: validBatchIds },
      active: true,
    })
      .select("_id")
      .lean();

    if (batches.length !== validBatchIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some selected batches do not exist or are inactive",
      });
    }

    // 10. Get active student counts
    const studentCounts = await StudentRegistration.aggregate([
      {
        $match: {
          status: "active",
          batch: {
            $in: batches.map((item) => item._id),
          },
        },
      },
      {
        $group: {
          _id: "$batch",
          totalStudents: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      studentCounts.map((item) => [
        String(item._id),
        item.totalStudents,
      ])
    );

    // 11. Prepare assignment batches
    const assignedOn = new Date();

    const assignmentBatches = batches.map((batch) => ({
      batch: batch._id,
      studentCount: countMap.get(String(batch._id)) || 0,
      assignedOn,
    }));

    // 12. Create or update assignment
    const assignment = await TestAssignment.findOneAndUpdate(
      { test: testId },
      {
        $set: {
          batches: assignmentBatches,
          schedule: {
            useDefaultSchedule,
            startDate,
            endDate,
            solutionUnlockDate,
          },
          status: "Assigned",
          updatedBy: req.user?.name || "super admin",
        },
        $setOnInsert: {
          createdBy: req.user?.name || "super admin",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // 13. Update TestList status
    const updatedStatus = await updateTestStatus(testId);

    // 14. Success response
    return res.json({
      success: true,
      message: "Test assigned successfully",
      data: assignment,
      status: updatedStatus,
    });
  } catch (error) {
    console.error("========== SAVE TEST ASSIGNMENT ERROR ==========");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Details:", error);
    console.error("Validation Errors:", error.errors);
    console.error("=================================================");

    return res.status(500).json({
      success: false,
      message: "Unable to save test assignment",
      error: error.message,
      errorName: error.name,
      validationErrors: error.errors || null,
    });
  }
};
