const express = require("express");
const router = express.Router();
const testStudentController = require("../../controller/student/testStudentController");

// Get all tests
router.get("/student/:studentId/tests", testStudentController.getAllTests);

// Get test statistics
router.get(
  "/student/:studentId/tests/stats",
  testStudentController.getTestStats
);

// Get single test
router.get(
  "/student/:studentId/tests/:testId",
  testStudentController.getTestById
);

// Create test
router.post("/student/:studentId/tests", testStudentController.createTest);

// Update test
router.put(
  "/student/:studentId/tests/:testId",
  testStudentController.updateTest
);

// Delete test
router.delete(
  "/student/:studentId/tests/:testId",
  testStudentController.deleteTest
);

// Toggle publish
router.patch(
  "/student/:studentId/tests/:testId/publish",
  testStudentController.togglePublishTest
);

router.post(
  "/student/:studentId/tests/:testId/submit",
  testStudentController.submitTest
);

// Get student submissions
router.get(
  "/student/:studentId/submissions",
  testStudentController.getStudentSubmissions
);

// Get specific submission
router.get(
  "/student/:studentId/submissions/:submissionId",
  testStudentController.getSubmissionDetails
);

module.exports = router;
