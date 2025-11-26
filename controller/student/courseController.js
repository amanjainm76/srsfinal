const Course = require("../../models/student/Course");
const StudentCourseEnrollment = require("../../models/student/StudentCourseEnrollment");
const StudentRegistration = require("../../models/StudentRegistration");

// Helper function to validate ObjectId
const isValidObjectId = id => {
  return id && typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
};

// Format date helper
const formatDate = () => {
  const date = new Date();
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;

    // Validation
    if (!courseData.courseName || !courseData.courseDescription) {
      return res.status(400).json({
        success: false,
        message: "Course name and description are required",
      });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({
      courseName: courseData.courseName,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course with this name already exists",
      });
    }

    // Create course
    const course = await Course.create({
      ...courseData,
      createdBy: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: {
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        image: course.courseImage,
        subjectsCount: course.subjects.length,
        createdAt: course.formattedCreatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
};

// Get all courses (Admin)
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { courseName: { $regex: search, $options: "i" } },
            { courseDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get courses with pagination
    const courses = await Course.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCourses = await Course.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses: totalCourses,
        limit: parseInt(limit),
      },
      courses: courses.map(course => ({
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        image: course.courseImage,
        subjectsCount: course.subjects.length,
        isActive: course.isActive,
        createdAt: course.formattedCreatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      course: {
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        image: course.courseImage,
        subjects: course.subjects,
        isActive: course.isActive,
        createdBy: course.createdBy,
        createdAt: course.formattedCreatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: {
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        image: course.courseImage,
        subjectsCount: course.subjects.length,
        isActive: course.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Error updating course",
      error: error.message,
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Check if any students are enrolled in this course
    const enrollmentCount = await StudentCourseEnrollment.countDocuments({
      courseId: courseId,
      status: "active",
    });

    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course. Students are still enrolled.",
      });
    }

    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      deletedCourse: {
        id: course._id,
        name: course.courseName,
      },
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
      error: error.message,
    });
  }
};

// Get student's enrolled courses
const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find student to get registration number
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get student's enrolled courses with course details
    const enrollments = await StudentCourseEnrollment.find({
      studentId: studentId,
      status: "active",
    }).populate(
      "courseId",
      "courseName courseDescription courseImage subjects isActive"
    );

    // Filter active courses only
    const activeCourses = enrollments.filter(
      enrollment => enrollment.courseId && enrollment.courseId.isActive
    );

    res.status(200).json({
      success: true,
      message: "Student courses retrieved successfully",
      student: {
        id: student._id,
        name: student.studentName,
        registrationNumber: student.registrationNumber,
        email: student.studentEmail,
      },
      enrollments: activeCourses.length,
      courses: activeCourses.map(enrollment => ({
        enrollmentId: enrollment._id,
        courseId: enrollment.courseId._id,
        courseName: enrollment.courseId.courseName,
        courseDescription: enrollment.courseId.courseDescription,
        courseImage: enrollment.courseId.courseImage,
        enrollmentDate: enrollment.formattedEnrollmentDate,
        status: enrollment.status,
        progress: enrollment.progress,
        subjectsCount: enrollment.courseId.subjects.length,
      })),
    });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student courses",
      error: error.message,
    });
  }
};

// Get subjects for a specific course
const getCourseSubjects = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID format",
      });
    }

    // Verify student enrollment
    const enrollment = await StudentCourseEnrollment.findOne({
      studentId: studentId,
      courseId: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Student not enrolled in this course or enrollment inactive",
      });
    }

    // Get course with subjects
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course subjects retrieved successfully",
      course: {
        id: course._id,
        name: course.courseName,
        description: course.courseDescription,
        image: course.courseImage,
      },
      subjects: course.subjects.map(subject => ({
        subjectName: subject.subjectName,
        subjectImage: subject.subjectImage,
        chaptersCount: subject.chapters.length,
        chapters: subject.chapters.map(chapter => ({
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.chapterTitle,
          chapterDescription: chapter.chapterDescription,
          topicsCount: chapter.topics.length,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching course subjects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course subjects",
      error: error.message,
    });
  }
};

// Get chapters for a specific subject
const getSubjectChapters = async (req, res) => {
  try {
    const { studentId, courseId, subjectName } = req.params;

    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID format",
      });
    }

    // Verify student enrollment
    const enrollment = await StudentCourseEnrollment.findOne({
      studentId: studentId,
      courseId: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Student not enrolled in this course",
      });
    }

    // Get course and find subject
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const subject = course.subjects.find(
      sub => sub.subjectName.toLowerCase() === subjectName.toLowerCase()
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found in this course",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject chapters retrieved successfully",
      subject: {
        name: subject.subjectName,
        image: subject.subjectImage,
        chaptersCount: subject.chapters.length,
      },
      chapters: subject.chapters.map(chapter => ({
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.chapterTitle,
        chapterDescription: chapter.chapterDescription,
        topicsCount: chapter.topics.length,
        createdAt: chapter.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching subject chapters:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subject chapters",
      error: error.message,
    });
  }
};

// Get topics for a specific chapter
const getChapterTopics = async (req, res) => {
  try {
    const { studentId, courseId, subjectName, chapterNumber } = req.params;

    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID format",
      });
    }

    // Verify student enrollment
    const enrollment = await StudentCourseEnrollment.findOne({
      studentId: studentId,
      courseId: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Student not enrolled in this course",
      });
    }

    // Get course and find subject and chapter
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const subject = course.subjects.find(
      sub => sub.subjectName.toLowerCase() === subjectName.toLowerCase()
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const chapter = subject.chapters.find(
      ch => ch.chapterNumber === parseInt(chapterNumber)
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chapter topics retrieved successfully",
      chapter: {
        number: chapter.chapterNumber,
        title: chapter.chapterTitle,
        description: chapter.chapterDescription,
        topicsCount: chapter.topics.length,
      },
      topics: chapter.topics.map(topic => ({
        topicTitle: topic.topicTitle,
        topicContent: topic.topicContent,
        videoId: topic.videoId,
        pdfUrl: topic.pdfUrl,
        hasVideo: !!topic.videoId,
        hasPdf: !!topic.pdfUrl,
        additionalResources: topic.additionalResources,
      })),
    });
  } catch (error) {
    console.error("Error fetching chapter topics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chapter topics",
      error: error.message,
    });
  }
};

// Update student progress
const updateStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { subjectName, chapterNumber, topicTitle } = req.body;

    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID format",
      });
    }

    // Find enrollment
    const enrollment = await StudentCourseEnrollment.findOne({
      studentId: studentId,
      courseId: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Add completed topic if not already exists
    const existingTopic = enrollment.progress.completedTopics.find(
      topic =>
        topic.subjectName === subjectName &&
        topic.chapterNumber === parseInt(chapterNumber) &&
        topic.topicTitle === topicTitle
    );

    if (!existingTopic) {
      enrollment.progress.completedTopics.push({
        subjectName,
        chapterNumber: parseInt(chapterNumber),
        topicTitle,
        completedAt: new Date(),
      });
    }

    // Check if chapter is completed (all topics completed)
    const course = await Course.findById(courseId);
    const subject = course.subjects.find(
      sub => sub.subjectName === subjectName
    );
    const chapter = subject.chapters.find(
      ch => ch.chapterNumber === parseInt(chapterNumber)
    );

    const completedTopicsInChapter = enrollment.progress.completedTopics.filter(
      topic =>
        topic.subjectName === subjectName &&
        topic.chapterNumber === parseInt(chapterNumber)
    );

    // If all topics in chapter are completed, mark chapter as completed
    if (completedTopicsInChapter.length === chapter.topics.length) {
      const existingChapter = enrollment.progress.completedChapters.find(
        ch =>
          ch.subjectName === subjectName &&
          ch.chapterNumber === parseInt(chapterNumber)
      );

      if (!existingChapter) {
        enrollment.progress.completedChapters.push({
          subjectName,
          chapterNumber: parseInt(chapterNumber),
          completedAt: new Date(),
        });
      }
    }

    // Calculate overall progress
    const totalTopics = course.subjects.reduce(
      (total, subject) =>
        total +
        subject.chapters.reduce(
          (chTotal, chapter) => chTotal + chapter.topics.length,
          0
        ),
      0
    );
    const completedTopicsCount = enrollment.progress.completedTopics.length;
    enrollment.progress.overallProgress = Math.round(
      (completedTopicsCount / totalTopics) * 100
    );

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    });
  }
};

// Enroll student in course
const enrollStudentInCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID format",
      });
    }

    // Check if student exists
    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await StudentCourseEnrollment.findOne({
      studentId: studentId,
      courseId: courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await StudentCourseEnrollment.create({
      studentId: studentId,
      studentRegistrationNumber: student.registrationNumber,
      courseId: courseId,
      enrolledBy: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Student enrolled in course successfully",
      enrollment: {
        id: enrollment._id,
        studentId: enrollment.studentId,
        studentRegistrationNumber: enrollment.studentRegistrationNumber,
        courseId: enrollment.courseId,
        enrollmentDate: enrollment.formattedEnrollmentDate,
        status: enrollment.status,
      },
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling student in course",
      error: error.message,
    });
  }
};

module.exports = {
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
};
