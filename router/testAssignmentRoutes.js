
const express = require("express");
const router = express.Router();

const {
  getTestForAssignment,
  getBatchesForAssignment,
  getAssignmentCenters,
  saveTestAssignment
} = require("../controller/testAssignmentController");

// Keep specific routes before dynamic testId routes
router.get("/centers/list", getAssignmentCenters);

router.get("/:testId/batches", getBatchesForAssignment);

router.get("/:testId", getTestForAssignment);

router.post("/", saveTestAssignment);

module.exports = router;
