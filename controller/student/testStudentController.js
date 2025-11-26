const mongoose = require("mongoose");
const StudentTest = require("../../models/student/StudentTest");
const StudentRegistration = require("../../models/StudentRegistration");
const TestSubmission = require("../../models/student/TestSubmission"); // ✅ Import new model

// Get all tests for a student
exports.getAllTests = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const tests = await StudentTest.find({
      studentId: studentId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Tests retrieved successfully",
      student: {
        id: student._id,
        name: student.studentName,
        registrationNumber: student.registrationNumber,
      },
      count: tests.length,
      tests,
    });
  } catch (error) {
    console.error("Get all tests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
      error: error.message,
    });
  }
};

// Get test by ID
exports.getTestById = async (req, res) => {
  try {
    const { studentId, testId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const test = await StudentTest.findOne({
      _id: testId,
      studentId: studentId,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.json({
      success: true,
      message: "Test retrieved successfully",
      test,
    });
  } catch (error) {
    console.error("Get test by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
};

// Create new test
exports.createTest = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, subject, instructions, totalMarks, timeLimit, questions } =
      req.body;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!title || !subject || !totalMarks || !timeLimit) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, total marks, and time limit are required",
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one question",
      });
    }

    const newTest = new StudentTest({
      studentId: studentId,
      title,
      subject,
      instructions: instructions || "",
      totalMarks,
      timeLimit,
      questions,
      questionsCount: questions.length,
    });

    await newTest.save();

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      test: newTest,
    });
  } catch (error) {
    console.error("Create test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test",
      error: error.message,
    });
  }
};

// Update test
exports.updateTest = async (req, res) => {
  try {
    const { studentId, testId } = req.params;
    const { title, subject, instructions, totalMarks, timeLimit, questions } =
      req.body;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const test = await StudentTest.findOne({
      _id: testId,
      studentId: studentId,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (title) test.title = title;
    if (subject) test.subject = subject;
    if (instructions !== undefined) test.instructions = instructions;
    if (totalMarks) test.totalMarks = totalMarks;
    if (timeLimit) test.timeLimit = timeLimit;
    if (questions) {
      test.questions = questions;
      test.questionsCount = questions.length;
    }

    await test.save();

    res.json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    console.error("Update test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update test",
      error: error.message,
    });
  }
};

// Delete test (soft delete)
exports.deleteTest = async (req, res) => {
  try {
    const { studentId, testId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const test = await StudentTest.findOne({
      _id: testId,
      studentId: studentId,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    test.isActive = false;
    await test.save();

    res.json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Delete test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete test",
      error: error.message,
    });
  }
};

// Toggle publish test
exports.togglePublishTest = async (req, res) => {
  try {
    const { studentId, testId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const test = await StudentTest.findOne({
      _id: testId,
      studentId: studentId,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    test.isPublished = !test.isPublished;
    await test.save();

    res.json({
      success: true,
      message: `Test ${
        test.isPublished ? "published" : "unpublished"
      } successfully`,
      test,
    });
  } catch (error) {
    console.error("Toggle publish test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update test status",
      error: error.message,
    });
  }
};

// ✅ NEW: Submit Test
exports.submitTest = async (req, res) => {
  try {
    const { studentId, testId } = req.params;
    const { answers, timeTaken } = req.body;

    console.log("📥 Received submission:", {
      studentId,
      testId,
      answers,
      timeTaken,
    });

    // Verify student
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify test
    const test = await StudentTest.findOne({
      _id: testId,
      studentId: studentId,
      isActive: true,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check if already submitted
    const existingSubmission = await TestSubmission.findOne({
      testId: testId,
      studentId: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this test",
        submissionId: existingSubmission._id,
      });
    }

    // Calculate score (for MCQ and True/False only)
    let obtainedMarks = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    test.questions.forEach((question, index) => {
      const studentAnswer = answers[index];

      if (!studentAnswer || studentAnswer.trim() === "") {
        unanswered++;
        return;
      }

      // Check answer for MCQ and True/False
      if (
        question.type === "multiple-choice" ||
        question.type === "true-false"
      ) {
        if (studentAnswer === question.correctAnswer) {
          obtainedMarks += question.marks;
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      }
      // For essay and short-answer, marks need manual evaluation
    });

    const percentage = ((obtainedMarks / test.totalMarks) * 100).toFixed(2);

    // ✅ CREATE AND SAVE SUBMISSION TO DATABASE
    const newSubmission = new TestSubmission({
      testId: test._id,
      studentId: studentId,
      answers: answers,
      obtainedMarks: obtainedMarks,
      totalMarks: test.totalMarks,
      percentage: parseFloat(percentage),
      correctAnswers: correctAnswers,
      wrongAnswers: wrongAnswers,
      unanswered: unanswered,
      timeTaken: timeTaken,
      submittedAt: new Date(),
      isEvaluated: correctAnswers + wrongAnswers === test.questions.length, // Auto-evaluated if all MCQ/True-False
    });

    await newSubmission.save(); // ✅ SAVE TO DATABASE

    console.log("✅ Submission saved to database:", newSubmission._id);

    // Return response
    res.json({
      success: true,
      message: "Test submitted successfully",
      submissionId: newSubmission._id,
      result: {
        testTitle: test.title,
        obtainedMarks: obtainedMarks,
        totalMarks: test.totalMarks,
        percentage: percentage,
        correctAnswers: correctAnswers,
        wrongAnswers: wrongAnswers,
        unanswered: unanswered,
        timeTaken:
          Math.floor(timeTaken / 60) +
          " minutes " +
          (timeTaken % 60) +
          " seconds",
      },
    });
  } catch (error) {
    console.error("❌ Submit test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit test",
      error: error.message,
    });
  }
};

// Get all submissions for a student
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await TestSubmission.find({ studentId: studentId })
      .populate("testId", "title subject totalMarks")
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions: submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Get specific submission details
exports.getSubmissionDetails = async (req, res) => {
  try {
    const { studentId, submissionId } = req.params;

    const submission = await TestSubmission.findOne({
      _id: submissionId,
      studentId: studentId,
    }).populate("testId");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.json({
      success: true,
      submission: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

// Get test statistics
exports.getTestStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const totalTests = await StudentTest.countDocuments({
      studentId: studentId,
      isActive: true,
    });

    const publishedTests = await StudentTest.countDocuments({
      studentId: studentId,
      isActive: true,
      isPublished: true,
    });

    const totalQuestions = await StudentTest.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$questionsCount" },
        },
      },
    ]);

    const subjectStats = await StudentTest.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      message: "Test statistics retrieved successfully",
      stats: {
        totalTests,
        publishedTests,
        draftTests: totalTests - publishedTests,
        totalQuestions: totalQuestions[0]?.total || 0,
        subjectBreakdown: subjectStats,
      },
    });
  } catch (error) {
    console.error("Get test stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test statistics",
      error: error.message,
    });
  }
};

module.exports = exports;
