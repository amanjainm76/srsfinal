const express = require("express");
const router = express.Router();
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controller/subjectController");

// Route to create a new subject
router.post("/subjects", createSubject);

// Route to get all subjects
router.get("/subjects", getAllSubjects);

// Route to get a single subject by ID
router.get("/subjects/:id", getSubjectById);

// Route to update a subject by ID
router.put("/subjects/:id", updateSubject);

// Route to delete a subject by ID
router.delete("/subjects/:id", deleteSubject);

module.exports = router;
