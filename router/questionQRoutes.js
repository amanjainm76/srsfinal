const express = require("express");
const router = express.Router();
const questionController = require("../controller/questionController"); // Import the controller

// Question routes
router.post("/ques", questionController.createQuestion); // Create a new question
router.get("/ques/filter", questionController.filterQuestionsByStream);
router.get("/ques/subject", questionController.filterQuestionsBySubjectType);
router.get(
  "/ques/streamSubject",
  questionController.filterQuestionsByStreamAndSubjectType
);
router.get(
  "/ques/filter-by-subtopic",
  questionController.filterQuestionsBySubTopic
);
router.get("/ques/filter-by-skill", questionController.filterQuestionsBySkill);
router.get("/ques/filter-by-level", questionController.filterQuestionsByLevel);
router.get("/ques/filter-by-type", questionController.filterQuestionsByType);
router.get(
  "/ques/filter-by-status",
  questionController.filterQuestionsByStatus
);
router.get(
  "/ques/filter-by-SRSUniqueCode",
  questionController.filterQuestionsBySRSUniqueCode
);
router.get(
  "/ques/filter-by-enterQuestion",
  questionController.filterQuestionsByEnterQuestion
);
router.get("/ques/reset", questionController.resetFilters);
router.get("/ques", questionController.getAllQuestions); // Get all questions
router.get("/ques/:id", questionController.getQuestionById); // Get a specific question
router.put("/ques/:id", questionController.updateQuestion); // Update a specific question using SRSUniqueCode

router.delete("/ques/:id", questionController.deleteQuestion); // Delete a specific question

router.get("/ques/stream/:stream", questionController.getQuestionsByStream); // Get questions by stream
router.get(
  "/ques/subject/:subjectType",
  questionController.getQuestionsBySubject
); // Get questions by subject type

module.exports = router;
