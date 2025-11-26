// controller/studentRegistrationController.js - COMPLETE CODE

const StudentRegistration = require("../models/StudentRegistration");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

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

// Student Registration
const createStudentRegistration = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      studentPhone,
      course,
      qualification,
      fatherName,
      motherName,
      state,
      city,
      pincode,
      address,
      password,
    } = req.body;

    // Validation
    const requiredFields = [
      "studentName",
      "studentEmail",
      "studentPhone",
      "course",
      "qualification",
      "fatherName",
      "motherName",
      "state",
      "city",
      "pincode",
      "address",
      "password",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Clean phone number
    const cleanPhone = studentPhone.replace(/\D/g, "");
    const cleanEmail = studentEmail.toLowerCase();

    // Check for existing phone
    const existingPhone = await StudentRegistration.findOne({
      studentPhone: cleanPhone,
    });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Check for existing email
    const existingEmail = await StudentRegistration.findOne({
      studentEmail: cleanEmail,
    });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new student
    const newStudent = await StudentRegistration.create({
      studentName,
      studentEmail: cleanEmail,
      studentPhone: cleanPhone,
      course,
      qualification,
      fatherName,
      motherName,
      state,
      city,
      pincode,
      address,
      password,
      createdBy: "registration",
      updatedOn: formatDate(),
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: {
        id: newStudent._id,
        studentName: newStudent.studentName,
        studentEmail: newStudent.studentEmail,
        studentPhone: newStudent.studentPhone,
        course: newStudent.course,
        registrationNumber: newStudent.registrationNumber,
        registrationDate: newStudent.registrationDate,
        status: newStudent.status,
      },
    });
  } catch (error) {
    console.error("Error creating student registration:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        err => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating student registration",
      error: error.message,
    });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }

    // Find student by email or phone
    const student = await StudentRegistration.findByEmailOrPhone(
      identifier
    ).select("+password");
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (student.isLocked) {
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to too many failed attempts",
        lockUntil: student.lockUntil,
      });
    }

    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      await student.incrementLoginAttempts();
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    if (student.loginAttempts > 0) {
      await student.resetLoginAttempts();
    }

    // Update last login
    const now = new Date();
    student.lastLogin = now;
    student.lastLoginFormatted = formatDate();
    await student.save();

    res.json({
      success: true,
      message: "Login successful",
      student: {
        id: student._id,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        registrationNumber: student.registrationNumber,
        course: student.course,
        status: student.status,
        profileImage: student.studentprofileImage,
        lastLogin: student.lastLoginFormatted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get all student registrations
const getAllStudentRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.course) filter.course = new RegExp(req.query.course, "i");
    if (req.query.search) {
      filter.$or = [
        { studentName: new RegExp(req.query.search, "i") },
        { studentEmail: new RegExp(req.query.search, "i") },
        { registrationNumber: new RegExp(req.query.search, "i") },
      ];
    }

    const students = await StudentRegistration.find(filter)
      .select("-password -passwordResetToken -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudentRegistration.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      students: students,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Get student registration by ID
const getStudentRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const student = await StudentRegistration.findById(id).select(
      "-password -passwordResetToken -__v"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      student: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
};

// Get current student profile
const getCurrentStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const student = await StudentRegistration.findById(id).select(
      "-password -passwordResetToken -__v"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student profile retrieved successfully",
      student: student,
    });
  } catch (error) {
    console.error("Error fetching current student profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student profile",
      error: error.message,
    });
  }
};

// Update current student profile
const updateCurrentStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find existing student first
    const existingStudent = await StudentRegistration.findById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Validate email uniqueness if being updated
    if (
      updateData.studentEmail &&
      updateData.studentEmail !== existingStudent.studentEmail
    ) {
      const emailExists = await StudentRegistration.findOne({
        studentEmail: updateData.studentEmail.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Validate phone uniqueness if being updated
    if (updateData.studentPhone) {
      const cleanPhone = updateData.studentPhone.replace(/\D/g, "");
      if (cleanPhone !== existingStudent.studentPhone) {
        const phoneExists = await StudentRegistration.findOne({
          studentPhone: cleanPhone,
          _id: { $ne: id },
        });

        if (phoneExists) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists",
          });
        }
      }
      updateData.studentPhone = cleanPhone;
    }

    // Handle password update with proper validation
    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      // Password validation regex
      if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(
          updateData.password
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least one letter and one number",
        });
      }
    }

    // Prevent updating sensitive fields directly
    const protectedFields = [
      "loginAttempts",
      "lockUntil",
      "isAccountLocked",
      "passwordResetToken",
      "registrationNumber",
      "_id",
      "createdAt",
      "updatedAt",
      "__v",
    ];

    protectedFields.forEach(field => delete updateData[field]);

    // Clean email if provided
    if (updateData.studentEmail) {
      updateData.studentEmail = updateData.studentEmail.toLowerCase();
    }

    // Add update metadata
    updateData.updatedBy = "student";
    updateData.updatedOn = formatDate();

    // Update student with validation
    const updatedStudent = await StudentRegistration.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).select("-password -passwordResetToken -__v");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student profile:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        err => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating student profile",
      error: error.message,
    });
  }
};

// Admin update student by ID
const updateStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find existing student
    const existingStudent = await StudentRegistration.findById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate email uniqueness if being updated
    if (
      updateData.studentEmail &&
      updateData.studentEmail !== existingStudent.studentEmail
    ) {
      const emailExists = await StudentRegistration.findOne({
        studentEmail: updateData.studentEmail.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Validate phone uniqueness if being updated
    if (updateData.studentPhone) {
      const cleanPhone = updateData.studentPhone.replace(/\D/g, "");
      if (cleanPhone !== existingStudent.studentPhone) {
        const phoneExists = await StudentRegistration.findOne({
          studentPhone: cleanPhone,
          _id: { $ne: id },
        });

        if (phoneExists) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists",
          });
        }
      }
      updateData.studentPhone = cleanPhone;
    }

    // Handle password update
    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
    }

    // Prevent updating sensitive fields
    const protectedFields = [
      "loginAttempts",
      "lockUntil",
      "isAccountLocked",
      "passwordResetToken",
      "registrationNumber",
      "_id",
      "createdAt",
      "updatedAt",
      "__v",
    ];

    protectedFields.forEach(field => delete updateData[field]);

    // Clean email
    if (updateData.studentEmail) {
      updateData.studentEmail = updateData.studentEmail.toLowerCase();
    }

    // Add update metadata
    updateData.updatedBy = "admin";
    updateData.updatedOn = formatDate();

    // Update student
    const updatedStudent = await StudentRegistration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -passwordResetToken -__v");

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        err => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
};

// Create student profile
const createStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find existing student
    const student = await StudentRegistration.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Clean data
    if (updateData.studentPhone) {
      updateData.studentPhone = updateData.studentPhone.replace(/\D/g, "");
    }

    if (updateData.studentEmail) {
      updateData.studentEmail = updateData.studentEmail.toLowerCase();
    }

    // Add metadata
    updateData.profileCreated = true;
    updateData.profileCreatedOn = new Date();
    updateData.updatedBy = "student";
    updateData.updatedOn = formatDate();

    // Update student with profile data
    const updatedStudent = await StudentRegistration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -passwordResetToken -__v");

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      studentprofileData: updatedStudent,
    });
  } catch (error) {
    console.error("Error creating student profile:", error);
    res.status(500).json({
      success: false,
      message: "Error creating student profile",
      error: error.message,
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Create image path
    const imagePath = `/uploads/profile-images/${req.file.filename}`;

    // Get current student to delete old image
    const currentStudent = await StudentRegistration.findById(id);

    if (!currentStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete old image if it exists and is not default
    if (
      currentStudent?.studentprofileImage &&
      currentStudent.studentprofileImage !== "/assets/backend-img/user.png"
    ) {
      const oldImagePath = path.join(".", currentStudent.studentprofileImage);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }

    // Update student with new image path
    const updatedStudent = await StudentRegistration.findByIdAndUpdate(
      id,
      {
        $set: {
          studentprofileImage: imagePath,
          updatedBy: "student",
          updatedOn: formatDate(),
        },
      },
      { new: true }
    ).select("studentprofileImage");

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: imagePath,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);

    // Delete uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, err => {
        if (err) console.error("Error deleting file on error:", err);
      });
    }

    res.status(500).json({
      success: false,
      message: "Error uploading profile image",
      error: error.message,
    });
  }
};

// Delete current student profile
const deleteCurrentStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find the student first
    const student = await StudentRegistration.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Optional: Require password confirmation for deletion
    if (req.body.confirmPassword) {
      const isPasswordValid = await student.comparePassword(
        req.body.confirmPassword
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Password confirmation failed",
        });
      }
    }

    // Delete profile image if it's not the default
    if (
      student.studentprofileImage &&
      student.studentprofileImage !== "/assets/backend-img/user.png"
    ) {
      const imagePath = path.join(".", student.studentprofileImage);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("Profile image deleted:", imagePath);
        } catch (err) {
          console.error("Error deleting profile image:", err);
        }
      }
    }

    // Delete the student profile
    await StudentRegistration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Student profile deleted successfully",
      deletedStudentId: id,
    });
  } catch (error) {
    console.error("Error deleting student profile:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student profile",
      error: error.message,
    });
  }
};

// Delete student by ID (Admin)
const deleteStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Find the student first
    const student = await StudentRegistration.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete profile image if it exists and is not default
    if (
      student.studentprofileImage &&
      student.studentprofileImage !== "/assets/backend-img/user.png"
    ) {
      const imagePath = path.join(".", student.studentprofileImage);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("Profile image deleted:", imagePath);
        } catch (err) {
          console.error("Error deleting profile image:", err);
        }
      }
    }

    // Delete the student
    await StudentRegistration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      deletedStudent: {
        id: student._id,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
      },
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

// Get student dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const student = await StudentRegistration.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const dashboardData = {
      profile: {
        name: student.studentName,
        email: student.studentEmail,
        registrationNumber: student.registrationNumber,
        course: student.course,
        status: student.status,
        profileImage: student.studentprofileImage,
        registrationDate: formatDate(student.registrationDate),
        lastLogin: student.lastLoginFormatted,
      },
      stats: {
        profileCompletion: student.profileCreated ? 100 : 75,
        accountStatus: student.status,
        memberSince: formatDate(student.registrationDate),
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const student = await StudentRegistration.findById(id).select("+password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await student.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Update password
    student.password = newPassword;
    student.updatedBy = "student";
    student.updatedOn = formatDate();
    await student.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during password change",
    });
  }
};

module.exports = {
  // Authentication
  createStudentRegistration,
  loginStudent,

  // Profile Management
  getCurrentStudentProfile,
  updateCurrentStudentProfile,
  createStudentProfile,
  uploadProfileImage,
  deleteCurrentStudentProfile,
  changePassword,
  getStudentDashboard,

  // Admin Functions
  getAllStudentRegistrations,
  getStudentRegistrationById,
  updateStudentById,
  deleteStudentById,
};
