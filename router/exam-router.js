// examRoutes.js
const express = require("express");
const router = express.Router();
const ExamController = require("../controller/examController"); // Import the controller functions

// Routes for the Exams
router.post("/exam", ExamController.createExam); // Create a new exam
router.get("/exam", ExamController.getAllExams); // Get all exams
router.get("/exam/:id", ExamController.getExamById); // Get exam by ID
router.put("/exam/:id", ExamController.updateExamById); // Update exam by ID
router.delete("/exam/:id", ExamController.deleteExamById); // Delete exam by ID

module.exports = router; // Export the router to use in app.js or server.js
