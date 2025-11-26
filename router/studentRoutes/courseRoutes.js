const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getStudentCourses,
  getCourseSubjects,
  getSubjectChapters,
  getChapterTopics,
  updateStudentProgress,
  enrollStudentInCourse,
} = require("../../controller/student/courseController");

// Admin course management routes
// Create new course
router.post("/create", createCourse);

// Get all courses (Admin)
router.get("/all", getAllCourses);

// Get course by ID
router.get("/course/:courseId", getCourseById);

// Update course
router.put("/course/:courseId", updateCourse);

// Delete course
router.delete("/course/:courseId", deleteCourse);

// Student course routes
// Get all courses for a student
router.get("/student/:studentId/courses", getStudentCourses);

// Get subjects for a specific course
router.get("/student/:studentId/course/:courseId/subjects", getCourseSubjects);

// Get chapters for a specific subject
router.get(
  "/student/:studentId/course/:courseId/subject/:subjectName/chapters",
  getSubjectChapters
);

// Get topics for a specific chapter
router.get(
  "/student/:studentId/course/:courseId/subject/:subjectName/chapter/:chapterNumber/topics",
  getChapterTopics
);

// Update student progress
router.post(
  "/student/:studentId/course/:courseId/progress",
  updateStudentProgress
);

// Enroll student in course (Admin functionality)
router.post(
  "/student/:studentId/course/:courseId/enroll",
  enrollStudentInCourse
);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Course API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
