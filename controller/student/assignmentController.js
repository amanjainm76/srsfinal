const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Assignment = require("../../models/student/Assignment");
const StudentRegistration = require("../../models/StudentRegistration");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/assignments/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `assignment-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, PNG files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get all assignments for a specific student
exports.getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, status, priority } = req.query;

    // Verify student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Build filter query with proper ObjectId conversion
    let filter = {
      "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
      isActive: true,
    };

    if (subject) {
      filter.subject = subject;
    }
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    const assignments = await Assignment.find(filter)
      .populate("assignedTo.studentId", "name email registrationNumber")
      .sort({ createdAt: -1 });

    // Format response for each assignment
    const formattedAssignments = assignments.map(assignment => {
      const studentAssignment = assignment.assignedTo.find(
        assigned => assigned.studentId._id.toString() === studentId
      );

      return {
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
        subjectId: assignment.subjectId,
        description: assignment.description,
        assignedDate: assignment.assignedDate,
        lastDate: assignment.lastDate,
        status: studentAssignment?.submissionStatus || assignment.status,
        priority: assignment.priority,
        instructor: assignment.instructor,
        marks: assignment.marks,
        difficulty: assignment.difficulty,
        estimatedTime: assignment.estimatedTime,
        topic: assignment.topic,
        submissionDate: studentAssignment?.submissionDate,
        submissionFile: studentAssignment?.submissionFile,
        submissionFileDetails: studentAssignment?.submissionFileDetails,
        grade: studentAssignment?.grade,
        feedback: studentAssignment?.feedback,
      };
    });

    res.json({
      success: true,
      message: `Assignments retrieved for ${student.name}`,
      student: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        email: student.email,
      },
      totalAssignments: formattedAssignments.length,
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error("Get student assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Get assignments by subject for a student
exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    // Verify student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Subject mapping
    const subjects = {
      1: "Physics",
      2: "Chemistry",
      3: "Mathematics",
    };

    const subjectName = subjects[subjectId];
    if (!subjectName) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    const assignments = await Assignment.find({
      "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
      subjectId: parseInt(subjectId),
      subject: subjectName,
      isActive: true,
    }).populate("assignedTo.studentId", "name email");

    const formattedAssignments = assignments.map(assignment => {
      const studentAssignment = assignment.assignedTo.find(
        assigned => assigned.studentId._id.toString() === studentId
      );

      return {
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
        subjectId: assignment.subjectId,
        description: assignment.description,
        assignedDate: assignment.assignedDate,
        lastDate: assignment.lastDate,
        status: studentAssignment?.submissionStatus || assignment.status,
        priority: assignment.priority,
        instructor: assignment.instructor,
        marks: assignment.marks,
        difficulty: assignment.difficulty,
        estimatedTime: assignment.estimatedTime,
        topic: assignment.topic,
      };
    });

    res.json({
      success: true,
      message: `${subjectName} assignments retrieved successfully`,
      student: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
      },
      subject: {
        id: parseInt(subjectId),
        name: subjectName,
        slug: subjectName.toLowerCase(),
      },
      totalAssignments: formattedAssignments.length,
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error("Get assignments by subject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject assignments",
      error: error.message,
    });
  }
};

// Get specific assignment details
exports.getAssignmentDetails = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;

    // Verify student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
      isActive: true,
    }).populate("assignedTo.studentId", "name email registrationNumber");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or not assigned to this student",
      });
    }

    const studentAssignment = assignment.assignedTo.find(
      assigned => assigned.studentId._id.toString() === studentId
    );

    const response = {
      id: assignment._id,
      name: assignment.name,
      subject: assignment.subject,
      subjectId: assignment.subjectId,
      description: assignment.description,
      assignedDate: assignment.assignedDate,
      lastDate: assignment.lastDate,
      status: studentAssignment?.submissionStatus || assignment.status,
      priority: assignment.priority,
      instructor: assignment.instructor,
      marks: assignment.marks,
      difficulty: assignment.difficulty,
      estimatedTime: assignment.estimatedTime,
      topic: assignment.topic,
      submissionDate: studentAssignment?.submissionDate,
      submissionFile: studentAssignment?.submissionFile,
      submissionFileDetails: studentAssignment?.submissionFileDetails,
      grade: studentAssignment?.grade,
      feedback: studentAssignment?.feedback,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };

    res.json({
      success: true,
      message: "Assignment details retrieved successfully",
      student: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        email: student.email,
      },
      assignment: response,
    });
  } catch (error) {
    console.error("Get assignment details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment details",
      error: error.message,
    });
  }
};

// Submit assignment with file upload
exports.submitAssignment = async (req, res) => {
  // Use multer middleware for file upload
  upload.single("submissionFile")(req, res, async err => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    try {
      const { studentId, assignmentId } = req.params;
      const { notes } = req.body;
      const uploadedFile = req.file;

      // Verify student exists
      const student = await StudentRegistration.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const assignment = await Assignment.findOne({
        _id: assignmentId,
        "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
        isActive: true,
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      // Check if assignment is overdue
      const currentDate = new Date();
      const lastDate = new Date(assignment.lastDate);

      if (currentDate > lastDate) {
        // Delete uploaded file if assignment is overdue
        if (uploadedFile) {
          fs.unlinkSync(uploadedFile.path);
        }
        return res.status(400).json({
          success: false,
          message: "Assignment submission deadline has passed",
        });
      }

      // Update submission status
      const studentAssignmentIndex = assignment.assignedTo.findIndex(
        assigned => assigned.studentId.toString() === studentId
      );

      if (studentAssignmentIndex !== -1) {
        assignment.assignedTo[studentAssignmentIndex].submissionStatus =
          "submitted";
        assignment.assignedTo[studentAssignmentIndex].submissionDate =
          new Date();

        // Store file information
        if (uploadedFile) {
          assignment.assignedTo[studentAssignmentIndex].submissionFile =
            uploadedFile.path;
          assignment.assignedTo[studentAssignmentIndex].submissionFileDetails =
            {
              filename: uploadedFile.filename,
              originalName: uploadedFile.originalname,
              mimetype: uploadedFile.mimetype,
              size: uploadedFile.size,
            };
        }

        // Store submission notes
        if (notes) {
          assignment.assignedTo[studentAssignmentIndex].submissionNotes = notes;
        }

        // Add to submission history
        assignment.assignedTo[studentAssignmentIndex].submissionHistory.push({
          action: "submitted",
          timestamp: new Date(),
          notes: notes || "Assignment submitted",
          performedBy: student.name,
        });
      }

      await assignment.save();

      res.json({
        success: true,
        message: "Assignment submitted successfully",
        submissionDate: new Date(),
        assignmentName: assignment.name,
        subject: assignment.subject,
        submittedFile: uploadedFile
          ? {
              originalName: uploadedFile.originalname,
              size: uploadedFile.size,
              mimetype: uploadedFile.mimetype,
            }
          : null,
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Submit assignment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit assignment",
        error: error.message,
      });
    }
  });
};

// Download assignment resources as PDF
exports.downloadAssignmentResources = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;

    // Verify student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or not assigned to this student",
      });
    }

    // Generate PDF content (you can use libraries like jsPDF, PDFKit, etc.)
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // Set response headers for PDF download
    const filename = `${assignment.name.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_Resources.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    doc.fontSize(20).text(assignment.name, 50, 50);
    doc.fontSize(12).text(`Subject: ${assignment.subject}`, 50, 80);
    doc.text(`Instructor: ${assignment.instructor}`, 50, 100);
    doc.text(
      `Assigned Date: ${assignment.assignedDate.toDateString()}`,
      50,
      120
    );
    doc.text(`Last Date: ${assignment.lastDate.toDateString()}`, 50, 140);
    doc.text(`Marks: ${assignment.marks}`, 50, 160);
    doc.text(`Priority: ${assignment.priority}`, 50, 180);
    doc.text(`Difficulty: ${assignment.difficulty}`, 50, 200);
    doc.text(`Estimated Time: ${assignment.estimatedTime}`, 50, 220);

    doc.fontSize(14).text("Description:", 50, 250);
    doc.fontSize(10).text(assignment.description, 50, 270, { width: 500 });

    // Add requirements if available from updated schema
    if (assignment.requirements && assignment.requirements.length > 0) {
      doc.fontSize(14).text("Requirements:", 50, 350);
      let yPosition = 370;
      assignment.requirements.forEach((req, index) => {
        doc.fontSize(10).text(`${index + 1}. ${req}`, 50, yPosition);
        yPosition += 20;
      });
    }

    // Add instructions if available
    if (assignment.instructions) {
      doc.fontSize(14).text("Instructions:", 50, 450);
      doc.fontSize(10).text(assignment.instructions, 50, 470, { width: 500 });
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Download resources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download assignment resources",
      error: error.message,
    });
  }
};

// Download submitted assignment file
exports.downloadSubmittedFile = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      "assignedTo.studentId": new mongoose.Types.ObjectId(studentId),
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const studentAssignment = assignment.assignedTo.find(
      assigned => assigned.studentId.toString() === studentId
    );

    if (!studentAssignment || !studentAssignment.submissionFile) {
      return res.status(404).json({
        success: false,
        message: "No submitted file found",
      });
    }

    const filePath = studentAssignment.submissionFile;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Submitted file not found on server",
      });
    }

    // Set appropriate headers and send file
    const fileDetails = studentAssignment.submissionFileDetails;
    res.setHeader("Content-Type", fileDetails.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileDetails.originalName}"`
    );

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Download submitted file error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download submitted file",
      error: error.message,
    });
  }
};

// Create sample assignments (FIXED - Uses req.body, Example Removed)
exports.createSampleAssignments = async (req, res) => {
  try {
    let sampleAssignments = req.body;

    if (
      !sampleAssignments ||
      !Array.isArray(sampleAssignments) ||
      sampleAssignments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide assignments data in request body as an array",
      });
    }

    const createdAssignments = await Assignment.insertMany(sampleAssignments);

    res.json({
      success: true,
      message: "Sample assignments created successfully",
      count: createdAssignments.length,
      assignments: createdAssignments.map(a => ({
        id: a._id,
        name: a.name,
        subject: a.subject,
        assignedStudents: a.assignedTo.length,
        studentIds: a.assignedTo.map(s => s.studentId),
      })),
    });
  } catch (error) {
    console.error("Create sample assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sample assignments",
      error: error.message,
    });
  }
};

// Assign assignment to student
exports.assignToStudent = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    // Verify student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if already assigned
    const alreadyAssigned = assignment.assignedTo.some(
      assigned => assigned.studentId.toString() === studentId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Assignment already assigned to this student",
      });
    }

    // Add student to assignment
    assignment.assignedTo.push({
      studentId: new mongoose.Types.ObjectId(studentId),
      submissionStatus: "not-started",
      submissionHistory: [
        {
          action: "assigned",
          timestamp: new Date(),
          notes: "Assignment assigned to student",
          performedBy: "System",
        },
      ],
    });

    await assignment.save();

    res.json({
      success: true,
      message: `Assignment "${assignment.name}" assigned to ${student.name}`,
      assignment: {
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
      },
      student: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
      },
    });
  } catch (error) {
    console.error("Assign to student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign assignment",
      error: error.message,
    });
  }
};

// Get all assignments (Admin function)
exports.getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, status, priority } = req.query;

    let filter = { isActive: true };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const assignments = await Assignment.find(filter)
      .populate("assignedTo.studentId", "name registrationNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      message: "All assignments retrieved successfully",
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      assignments: assignments.map(assignment => ({
        id: assignment._id,
        name: assignment.name,
        subject: assignment.subject,
        subjectId: assignment.subjectId,
        instructor: assignment.instructor,
        marks: assignment.marks,
        priority: assignment.priority,
        difficulty: assignment.difficulty,
        assignedDate: assignment.assignedDate,
        lastDate: assignment.lastDate,
        totalAssigned: assignment.assignedTo.length,
        assignedStudents: assignment.assignedTo.map(s => ({
          studentId: s.studentId._id,
          name: s.studentId.name,
          registrationNumber: s.studentId.registrationNumber,
          status: s.submissionStatus,
        })),
      })),
    });
  } catch (error) {
    console.error("Get all assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Delete assignment (Admin function)
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Soft delete
    assignment.isActive = false;
    await assignment.save();

    res.json({
      success: true,
      message: `Assignment "${assignment.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

// Update assignment (Complete replacement - PUT)
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;

    const existingAssignment = await Assignment.findById(assignmentId);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Preserve assignedTo if not provided
    if (!updateData.assignedTo) {
      updateData.assignedTo = existingAssignment.assignedTo;
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("assignedTo.studentId", "name registrationNumber");

    res.json({
      success: true,
      message: `Assignment "${updatedAssignment.name}" updated successfully`,
      assignment: {
        id: updatedAssignment._id,
        name: updatedAssignment.name,
        subject: updatedAssignment.subject,
        subjectId: updatedAssignment.subjectId,
        description: updatedAssignment.description,
        instructor: updatedAssignment.instructor,
        marks: updatedAssignment.marks,
        priority: updatedAssignment.priority,
        difficulty: updatedAssignment.difficulty,
        lastDate: updatedAssignment.lastDate,
        totalAssigned: updatedAssignment.assignedTo.length,
      },
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// Partial update assignment (PATCH)
exports.patchAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;

    const existingAssignment = await Assignment.findById(assignmentId);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: `Assignment "${updatedAssignment.name}" partially updated`,
      updatedFields: Object.keys(updateData),
      assignment: {
        id: updatedAssignment._id,
        name: updatedAssignment.name,
        subject: updatedAssignment.subject,
        marks: updatedAssignment.marks,
        priority: updatedAssignment.priority,
        difficulty: updatedAssignment.difficulty,
        lastDate: updatedAssignment.lastDate,
      },
    });
  } catch (error) {
    console.error("Patch assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to partially update assignment",
      error: error.message,
    });
  }
};

// Update student assignment status (Grade/Feedback)
exports.updateStudentAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { submissionStatus, grade, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const studentIndex = assignment.assignedTo.findIndex(
      s => s.studentId.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not assigned to this assignment",
      });
    }

    // Update student assignment
    if (submissionStatus) {
      assignment.assignedTo[studentIndex].submissionStatus = submissionStatus;
    }
    if (grade !== undefined) {
      assignment.assignedTo[studentIndex].grade = grade;
    }
    if (feedback) {
      assignment.assignedTo[studentIndex].feedback = feedback;
    }

    // Add to submission history
    assignment.assignedTo[studentIndex].submissionHistory.push({
      action: grade !== undefined ? "graded" : "status_updated",
      timestamp: new Date(),
      notes: feedback || `Status updated to ${submissionStatus}`,
      performedBy: "Instructor",
    });

    await assignment.save();

    res.json({
      success: true,
      message: "Student assignment status updated successfully",
      studentAssignment: assignment.assignedTo[studentIndex],
    });
  } catch (error) {
    console.error("Update student assignment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student assignment status",
      error: error.message,
    });
  }
};
