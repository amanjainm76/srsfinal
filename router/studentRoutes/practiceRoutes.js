const express = require("express");
const router = express.Router();

const {
  getAllSubjects,
  getSubjectById,
  getChaptersBySubject,
  getTopicsByChapter,
  getQuestionsByTopic,
  submitQuizAttempt,
  getStudentQuizAttempts,
  assignSubjectsToStudent,
  createSampleData,
  insertSubjects,
  insertChapters,
  insertTopics,
  insertQuestions,
} = require("../../controller/student/practiceController");

// ========================================
// STUDENT-SPECIFIC ROUTES
// ========================================

// Subject routes
router.get("/student/:studentId/subjects", getAllSubjects);
router.get("/student/:studentId/subjects/:subjectId", getSubjectById);

// Chapter routes
router.get(
  "/student/:studentId/subjects/:subjectId/chapters",
  getChaptersBySubject
);

// Topic routes
router.get(
  "/student/:studentId/subjects/:subjectId/chapters/:chapterId/topics",
  getTopicsByChapter
);

// Question routes
router.get(
  "/student/:studentId/subjects/:subjectId/chapters/:chapterId/topics/:topicId/questions",
  getQuestionsByTopic
);

// Quiz submission routes
router.post(
  "/quiz/:studentId/:subjectId/:chapterId/:topicId/submit",
  submitQuizAttempt
);

// Student quiz history routes
router.get("/student/:studentId/attempts", getStudentQuizAttempts);
router.get("/student/:studentId/quiz-history", getStudentQuizAttempts);

// ========================================
// ADMIN ROUTES
// ========================================

// Assign subjects to student
router.post("/student/:studentId/assign-subjects", assignSubjectsToStudent);

// Admin data creation routes
router.post("/create-sample-data", createSampleData);

// Dynamic insert routes
router.post("/insert-subjects", insertSubjects);
router.post("/insert-chapters", insertChapters);
router.post("/insert-topics", insertTopics);
router.post("/insert-questions", insertQuestions);

// ========================================
// HEALTH CHECK
// ========================================

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Practice API is running (Student-Specific)",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    note: "All routes now require studentId parameter",
    endpoints: {
      "Student Routes": [
        "GET /student/:studentId/subjects",
        "GET /student/:studentId/subjects/:subjectId",
        "GET /student/:studentId/subjects/:subjectId/chapters",
        "GET /student/:studentId/subjects/:subjectId/chapters/:chapterId/topics",
        "GET /student/:studentId/subjects/:subjectId/chapters/:chapterId/topics/:topicId/questions",
      ],
      "Quiz Routes": [
        "POST /quiz/:studentId/:subjectId/:chapterId/:topicId/submit",
        "GET /student/:studentId/attempts",
      ],
      "Admin Routes": [
        "POST /student/:studentId/assign-subjects",
        "POST /create-sample-data",
        "POST /insert-subjects",
        "POST /insert-chapters",
        "POST /insert-topics",
        "POST /insert-questions",
      ],
    },
  });
});

module.exports = router;
