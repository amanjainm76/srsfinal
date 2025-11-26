const mongoose = require("mongoose");
const StudentSubject = require("../../models/student/StudentSubject");
const StudentChapter = require("../../models/student/StudentChapter");
const StudentTopic = require("../../models/student/StudentTopic");
const StudentQuestion = require("../../models/student/StudentQuestion");
const StudentQuizAttempt = require("../../models/student/StudentQuizAttempt");
const StudentRegistration = require("../../models/StudentRegistration");

// Get all subjects for specific student
exports.getAllSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("Searching subjects for studentId:", studentId);

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log("Student found:", student.studentName);

    const subjects = await StudentSubject.find({
      studentId: studentId,
      isActive: true,
    }).sort({
      name: 1,
    });

    console.log("Final result:", subjects.length);

    res.json({
      success: true,
      message: "Subjects retrieved successfully",
      student: {
        id: student._id,
        name: student.studentName,
        registrationNumber: student.registrationNumber,
      },
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("Get all subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// Get subject by ID for specific student
exports.getSubjectById = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await StudentSubject.findOne({
      _id: subjectId,
      studentId: studentId,
      isActive: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or not assigned to this student",
      });
    }

    res.json({
      success: true,
      message: "Subject retrieved successfully",
      subject,
    });
  } catch (error) {
    console.error("Get subject by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
      error: error.message,
    });
  }
};

// Get chapters by subject for specific student
exports.getChaptersBySubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await StudentSubject.findOne({
      _id: subjectId,
      studentId: studentId,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or not assigned to this student",
      });
    }
    const allChapters = await StudentChapter.find({
      subjectId: subjectId,
    });

    // Check chapters with studentId filter
    const chapters = await StudentChapter.find({
      subjectId: subjectId,
      studentId: studentId,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      message: `Chapters retrieved for ${subject.name}`,
      student: {
        id: student._id,
        name: student.studentName,
      },
      subject: {
        id: subject._id,
        name: subject.name,
        icon: subject.icon,
      },
      count: chapters.length,
      chapters,
    });
  } catch (error) {
    console.error("Get chapters by subject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chapters",
      error: error.message,
    });
  }
};
// Get topics by chapter for specific student
exports.getTopicsByChapter = async (req, res) => {
  try {
    const { studentId, subjectId, chapterId } = req.params;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await StudentSubject.findOne({
      _id: subjectId,
      studentId: studentId,
    });

    const chapter = await StudentChapter.findOne({
      _id: chapterId,
      studentId: studentId,
    });

    if (!subject || !chapter) {
      return res.status(404).json({
        success: false,
        message: "Subject or Chapter not found or not assigned to this student",
      });
    }

    // Check total topics without studentId filter
    const allTopics = await StudentTopic.find({
      subjectId: subjectId,
      chapterId: chapterId,
    });
    console.log(
      "DEBUG TOPICS - Total topics for this chapter:",
      allTopics.length
    );

    const topics = await StudentTopic.find({
      subjectId: subjectId,
      chapterId: chapterId,
      studentId: studentId,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      message: `Topics retrieved for ${chapter.name}`,
      student: {
        id: student._id,
        name: student.studentName,
      },
      subject: {
        id: subject._id,
        name: subject.name,
        icon: subject.icon,
      },
      chapter: {
        id: chapter._id,
        name: chapter.name,
        icon: chapter.icon,
      },
      count: topics.length,
      topics,
    });
  } catch (error) {
    console.error("Get topics by chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
      error: error.message,
    });
  }
};

// Get questions by topic for specific student
exports.getQuestionsByTopic = async (req, res) => {
  try {
    const { studentId, subjectId, chapterId, topicId } = req.params;
    const { limit = 10 } = req.query;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await StudentSubject.findOne({
      _id: subjectId,
      studentId: studentId,
    });

    const chapter = await StudentChapter.findOne({
      _id: chapterId,
      studentId: studentId,
    });

    const topic = await StudentTopic.findOne({
      _id: topicId,
      studentId: studentId,
    });

    if (!subject || !chapter || !topic) {
      return res.status(404).json({
        success: false,
        message: "Subject, Chapter, or Topic not found",
      });
    }

    // Check total questions without studentId filter
    const allQuestions = await StudentQuestion.find({
      subjectId: subjectId,
      chapterId: chapterId,
      topicId: topicId,
    });

    // Check if questions have studentId
    if (allQuestions.length > 0) {
      console.log(
        "DEBUG QUESTIONS - First question has studentId?",
        allQuestions[0].studentId ? "Yes" : "No"
      );
      if (allQuestions[0].studentId) {
        console.log(
          "DEBUG QUESTIONS - First question studentId:",
          allQuestions[0].studentId
        );
      }
    }

    const questions = await StudentQuestion.find({
      subjectId: subjectId,
      chapterId: chapterId,
      topicId: topicId,
      studentId: studentId,
      isActive: true,
    })
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const questionsWithoutAnswers = questions.map(q => ({
      id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      marks: q.marks,
    }));

    res.json({
      success: true,
      message: `Questions retrieved for ${topic.name}`,
      student: {
        id: student._id,
        name: student.studentName,
      },
      subject: {
        id: subject._id,
        name: subject.name,
        icon: subject.icon,
      },
      chapter: {
        id: chapter._id,
        name: chapter.name,
        icon: chapter.icon,
      },
      topic: {
        id: topic._id,
        name: topic.name,
      },
      count: questionsWithoutAnswers.length,
      questions: questionsWithoutAnswers,
    });
  } catch (error) {
    console.error("Get questions by topic error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

// Submit quiz attempt (no changes needed in logic, but console logs updated)
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { studentId, subjectId, chapterId, topicId } = req.params;
    const { answers, timeSpent } = req.body;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const questions = await StudentQuestion.find({
      subjectId: subjectId,
      chapterId: chapterId,
      topicId: topicId,
      studentId: studentId,
      isActive: true,
    });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this topic",
      });
    }

    let correctAnswers = 0;
    let totalMarks = 0;

    const evaluatedQuestions = questions.map(question => {
      const studentAnswer = answers[question._id];
      let isCorrect = false;
      let marks = 0;

      if (question.type === "multiple-choice") {
        isCorrect = studentAnswer === question.correctAnswer;
        marks = isCorrect ? question.marks : 0;
      } else if (question.type === "fill-in-blank") {
        isCorrect =
          studentAnswer?.toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim();
        marks = isCorrect ? question.marks : 0;
      }

      if (isCorrect) correctAnswers++;
      totalMarks += marks;

      return {
        questionId: question._id,
        studentAnswer,
        isCorrect,
        marks,
      };
    });

    const scorePercentage =
      questions.length > 0
        ? Math.round((correctAnswers / questions.length) * 100)
        : 0;

    const quizAttempt = new StudentQuizAttempt({
      studentId,
      subjectId,
      chapterId,
      topicId,
      questions: evaluatedQuestions,
      totalQuestions: questions.length,
      correctAnswers,
      totalMarks,
      scorePercentage,
      timeSpent: timeSpent || 0,
      isCompleted: true,
    });

    await quizAttempt.save();

    console.log("DEBUG SUBMIT - Quiz saved, Score:", scorePercentage);

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        attemptId: quizAttempt._id,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        totalQuestions: questions.length,
        correctAnswers,
        scorePercentage,
        totalMarks,
        timeSpent: timeSpent || 0,
      },
    });
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message,
    });
  }
};

// Get student's quiz attempts
exports.getStudentQuizAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attempts = await StudentQuizAttempt.find({
      studentId,
      isCompleted: true,
    })
      .populate("subjectId", "name icon")
      .populate("chapterId", "name")
      .populate("topicId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudentQuizAttempt.countDocuments({
      studentId,
      isCompleted: true,
    });

    res.json({
      success: true,
      message: "Quiz attempts retrieved successfully",
      student: {
        id: student._id,
        name: student.studentName,
        registrationNumber: student.registrationNumber,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      attempts,
    });
  } catch (error) {
    console.error("Get student quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempts",
      error: error.message,
    });
  }
};

// Assign subjects to student
exports.assignSubjectsToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectIds } = req.body;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of subjectIds",
      });
    }

    const assignedSubjects = [];

    for (const subjectId of subjectIds) {
      const subject = await StudentSubject.findById(subjectId);
      if (subject) {
        const newSubject = new StudentSubject({
          studentId: studentId,
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          image: subject.image,
          alt: subject.alt,
          color: subject.color,
          totalChapters: subject.totalChapters,
          totalQuestions: subject.totalQuestions,
          isActive: true,
        });
        await newSubject.save();
        assignedSubjects.push(newSubject);
      }
    }

    res.json({
      success: true,
      message: `${assignedSubjects.length} subjects assigned to ${student.studentName}`,
      student: {
        id: student._id,
        name: student.studentName,
        registrationNumber: student.registrationNumber,
      },
      assignedSubjects,
    });
  } catch (error) {
    console.error("Assign subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign subjects",
      error: error.message,
    });
  }
};

// Insert subjects dynamically
exports.insertSubjects = async (req, res) => {
  try {
    const subjects = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide subjects data as an array in request body",
      });
    }

    const insertedSubjects = await StudentSubject.insertMany(subjects);

    res.json({
      success: true,
      message: "Subjects inserted successfully",
      count: insertedSubjects.length,
      subjects: insertedSubjects,
    });
  } catch (error) {
    console.error("Insert subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert subjects",
      error: error.message,
    });
  }
};

// Insert chapters dynamically
exports.insertChapters = async (req, res) => {
  try {
    const chapters = req.body;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide chapters data as an array in request body",
      });
    }

    const insertedChapters = await StudentChapter.insertMany(chapters);

    res.json({
      success: true,
      message: "Chapters inserted successfully",
      count: insertedChapters.length,
      chapters: insertedChapters,
    });
  } catch (error) {
    console.error("Insert chapters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert chapters",
      error: error.message,
    });
  }
};

// Insert topics dynamically
exports.insertTopics = async (req, res) => {
  try {
    const topics = req.body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide topics data as an array in request body",
      });
    }

    const insertedTopics = await StudentTopic.insertMany(topics);

    res.json({
      success: true,
      message: "Topics inserted successfully",
      count: insertedTopics.length,
      topics: insertedTopics,
    });
  } catch (error) {
    console.error("Insert topics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert topics",
      error: error.message,
    });
  }
};

// Insert questions dynamically
exports.insertQuestions = async (req, res) => {
  try {
    const questions = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide questions data as an array in request body",
      });
    }

    const insertedQuestions = await StudentQuestion.insertMany(questions);

    res.json({
      success: true,
      message: "Questions inserted successfully",
      count: insertedQuestions.length,
      questions: insertedQuestions,
    });
  } catch (error) {
    console.error("Insert questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert questions",
      error: error.message,
    });
  }
};

// Create sample data from request body
exports.createSampleData = async (req, res) => {
  try {
    const { subjects, chapters, topics, questions } = req.body;

    if (!subjects || !chapters || !topics || !questions) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide subjects, chapters, topics, and questions in request body",
        example: {
          subjects: [],
          chapters: [],
          topics: [],
          questions: [],
        },
      });
    }

    console.log("Creating sample practice data from request...");

    const insertedSubjects = await StudentSubject.insertMany(subjects);
    console.log(`${insertedSubjects.length} subjects created`);

    const insertedChapters = await StudentChapter.insertMany(chapters);
    console.log(`${insertedChapters.length} chapters created`);

    const insertedTopics = await StudentTopic.insertMany(topics);
    console.log(`${insertedTopics.length} topics created`);

    const insertedQuestions = await StudentQuestion.insertMany(questions);
    console.log(`${insertedQuestions.length} questions created`);

    res.json({
      success: true,
      message: "Sample data created successfully from request body!",
      data: {
        subjects: insertedSubjects.length,
        chapters: insertedChapters.length,
        topics: insertedTopics.length,
        questions: insertedQuestions.length,
      },
      insertedData: {
        subjects: insertedSubjects,
        chapters: insertedChapters,
        topics: insertedTopics,
        questions: insertedQuestions,
      },
    });
  } catch (error) {
    console.error("Create sample data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sample data",
      error: error.message,
    });
  }
};

module.exports = exports;
