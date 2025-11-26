const express = require("express");
const router = express.Router();

// Import controller functions (Updated with ALL functions including file operations)
const {
  getStudentAssignments,
  getAssignmentsBySubject,
  getAssignmentDetails,
  submitAssignment,
  downloadAssignmentResources, // NEW - Download assignment resources as PDF
  downloadSubmittedFile, // NEW - Download submitted assignment file
  createSampleAssignments,
  assignToStudent,
  getAllAssignments,
  deleteAssignment,
  updateAssignment, // Complete update (PUT)
  patchAssignment, // Partial update (PATCH)
  updateStudentAssignmentStatus, // Update student grade/status
} = require("../../controller/student/assignmentController");

// Student Assignment Routes
// Get all assignments for a student
router.get("/student/:studentId/assignments", getStudentAssignments);

// Get assignments by subject for a student
router.get(
  "/student/:studentId/subject/:subjectId/assignments",
  getAssignmentsBySubject
);

// Get specific assignment details
router.get(
  "/student/:studentId/assignment/:assignmentId",
  getAssignmentDetails
);

// Submit assignment with file upload
router.post(
  "/student/:studentId/assignment/:assignmentId/submit",
  submitAssignment
);

// NEW FILE DOWNLOAD ROUTES
// Download assignment resources as PDF
router.get(
  "/student/:studentId/assignment/:assignmentId/download-resources",
  downloadAssignmentResources
);

// Download submitted assignment file
router.get(
  "/student/:studentId/assignment/:assignmentId/download-submitted",
  downloadSubmittedFile
);

// Admin Routes
// Get all assignments (Admin panel)
router.get("/admin/assignments", getAllAssignments);

// Create sample assignments (for testing)
router.post("/create-samples", createSampleAssignments);

// Assign assignment to student
router.post("/assignment/:assignmentId/assign/:studentId", assignToStudent);

// Assignment Edit/Update Routes
router.put("/admin/assignment/:assignmentId", updateAssignment); // Complete update
router.patch("/admin/assignment/:assignmentId", patchAssignment); // Partial update
router.patch(
  "/admin/assignment/:assignmentId/student/:studentId",
  updateStudentAssignmentStatus
); // Update student status

// Delete assignment (Admin function - Soft delete)
router.delete("/admin/assignment/:assignmentId", deleteAssignment);

// NEW ADMIN FILE MANAGEMENT ROUTES
// Get submitted files for an assignment (Admin)
router.get("/admin/assignment/:assignmentId/submissions", async (req, res) => {
  try {
    const Assignment = require("../../models/student/Assignment");
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId).populate(
      "assignedTo.studentId",
      "name registrationNumber email"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const submissions = assignment.assignedTo
      .filter(student => student.submissionFile)
      .map(student => ({
        studentId: student.studentId._id,
        studentName: student.studentId.name,
        registrationNumber: student.studentId.registrationNumber,
        submissionDate: student.submissionDate,
        submissionFile: student.submissionFile,
        submissionFileDetails: student.submissionFileDetails,
        submissionStatus: student.submissionStatus,
        grade: student.grade,
        feedback: student.feedback,
      }));

    res.json({
      success: true,
      message: "Assignment submissions retrieved successfully",
      assignment: {
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
        totalSubmissions: submissions.length,
      },
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
});

// Download specific student's submitted file (Admin)
router.get(
  "/admin/assignment/:assignmentId/student/:studentId/download",
  downloadSubmittedFile
);

// Bulk download all submissions for an assignment (Admin)
router.get("/admin/assignment/:assignmentId/download-all", async (req, res) => {
  try {
    const Assignment = require("../../models/student/Assignment");
    const archiver = require("archiver");
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId).populate(
      "assignedTo.studentId",
      "name registrationNumber"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Create ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipFilename = `${assignment.name.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_All_Submissions.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );

    archive.pipe(res);

    // Add submitted files to archive
    const submittedFiles = assignment.assignedTo.filter(
      student => student.submissionFile
    );

    submittedFiles.forEach(student => {
      const fs = require("fs");
      if (fs.existsSync(student.submissionFile)) {
        const filename = `${student.studentId.registrationNumber}_${student.submissionFileDetails.originalName}`;
        archive.file(student.submissionFile, { name: filename });
      }
    });

    archive.finalize();
  } catch (error) {
    console.error("Bulk download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bulk download",
      error: error.message,
    });
  }
});

// NEW STATISTICS ROUTES
// Get assignment statistics
router.get("/admin/assignment/:assignmentId/stats", async (req, res) => {
  try {
    const Assignment = require("../../models/student/Assignment");
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const stats = {
      totalAssigned: assignment.assignedTo.length,
      submitted: assignment.assignedTo.filter(
        s =>
          s.submissionStatus === "submitted" || s.submissionStatus === "graded"
      ).length,
      graded: assignment.assignedTo.filter(s => s.submissionStatus === "graded")
        .length,
      pending: assignment.assignedTo.filter(
        s =>
          s.submissionStatus === "not-started" ||
          s.submissionStatus === "in-progress"
      ).length,
      overdue: assignment.assignedTo.filter(s => {
        const isOverdue = new Date() > new Date(assignment.lastDate);
        const notSubmitted =
          s.submissionStatus !== "submitted" && s.submissionStatus !== "graded";
        return isOverdue && notSubmitted;
      }).length,
    };

    // Calculate average grade
    const gradedAssignments = assignment.assignedTo.filter(
      s => s.grade !== undefined && s.grade !== null
    );
    stats.averageGrade =
      gradedAssignments.length > 0
        ? gradedAssignments.reduce((sum, s) => sum + s.grade, 0) /
          gradedAssignments.length
        : 0;

    // Submission rate
    stats.submissionRate =
      stats.totalAssigned > 0
        ? (stats.submitted / stats.totalAssigned) * 100
        : 0;

    res.json({
      success: true,
      message: "Assignment statistics retrieved successfully",
      assignment: {
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
        lastDate: assignment.lastDate,
      },
      statistics: stats,
    });
  } catch (error) {
    console.error("Get assignment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment statistics",
      error: error.message,
    });
  }
});

// Get overall assignment statistics (Admin dashboard)
router.get("/admin/assignments/dashboard-stats", async (req, res) => {
  try {
    const Assignment = require("../../models/student/Assignment");

    const totalAssignments = await Assignment.countDocuments({
      isActive: true,
    });

    const assignments = await Assignment.find({ isActive: true });

    let totalStudentsAssigned = 0;
    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalOverdue = 0;

    assignments.forEach(assignment => {
      totalStudentsAssigned += assignment.assignedTo.length;
      totalSubmissions += assignment.assignedTo.filter(
        s =>
          s.submissionStatus === "submitted" || s.submissionStatus === "graded"
      ).length;
      totalGraded += assignment.assignedTo.filter(
        s => s.submissionStatus === "graded"
      ).length;

      // Count overdue
      const isAssignmentOverdue = new Date() > new Date(assignment.lastDate);
      if (isAssignmentOverdue) {
        totalOverdue += assignment.assignedTo.filter(
          s =>
            s.submissionStatus !== "submitted" &&
            s.submissionStatus !== "graded"
        ).length;
      }
    });

    const stats = {
      totalAssignments,
      totalStudentsAssigned,
      totalSubmissions,
      totalGraded,
      totalOverdue,
      submissionRate:
        totalStudentsAssigned > 0
          ? (totalSubmissions / totalStudentsAssigned) * 100
          : 0,
      gradingRate:
        totalSubmissions > 0 ? (totalGraded / totalSubmissions) * 100 : 0,
    };

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      statistics: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Assignment API is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0", // Updated version
    endpoints: {
      student: [
        "GET /student/:studentId/assignments",
        "GET /student/:studentId/subject/:subjectId/assignments",
        "GET /student/:studentId/assignment/:assignmentId",
        "POST /student/:studentId/assignment/:assignmentId/submit (with file upload)",
        "GET /student/:studentId/assignment/:assignmentId/download-resources",
        "GET /student/:studentId/assignment/:assignmentId/download-submitted",
      ],
      admin: [
        "GET /admin/assignments",
        "POST /create-samples",
        "POST /assignment/:assignmentId/assign/:studentId",
        "PUT /admin/assignment/:assignmentId",
        "PATCH /admin/assignment/:assignmentId",
        "PATCH /admin/assignment/:assignmentId/student/:studentId",
        "DELETE /admin/assignment/:assignmentId",
        "GET /admin/assignment/:assignmentId/submissions",
        "GET /admin/assignment/:assignmentId/student/:studentId/download",
        "GET /admin/assignment/:assignmentId/download-all",
        "GET /admin/assignment/:assignmentId/stats",
        "GET /admin/assignments/dashboard-stats",
      ],
    },
  });
});

module.exports = router;
