// router/studentRegistrationRoutes.js - COMPLETE ROUTES

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import controller functions
const {
  createStudentRegistration,
  loginStudent,
  getAllStudentRegistrations,
  getStudentRegistrationById,
  getCurrentStudentProfile,
  updateCurrentStudentProfile,
  createStudentProfile,
  uploadProfileImage,
  deleteCurrentStudentProfile,
  changePassword,
  getStudentDashboard,
  updateStudentById,
  deleteStudentById,
} = require("../controller/studentRegistrationController");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile-images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `student-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// PUBLIC ROUTES
// Student Registration
router.post("/register", createStudentRegistration);

// Student Login
router.post("/login", loginStudent);

// Get all students
router.get("/students", getAllStudentRegistrations);

// Get student by ID
router.get("/student/:id", getStudentRegistrationById);

// PROFILE ROUTES WITH ID PARAMETER
// Get student profile by ID
router.get("/profile/:id", getCurrentStudentProfile);

// Create student profile by ID
router.post("/profile/:id", createStudentProfile);

// Update student profile by ID
router.put("/profile/:id", updateCurrentStudentProfile);

// Delete student profile by ID
router.delete("/profile/:id", deleteCurrentStudentProfile);

// Get student dashboard by ID
router.get("/dashboard/:id", getStudentDashboard);

// Change password by ID
router.put("/change-password/:id", changePassword);

// Upload profile image by ID
router.post(
  "/upload-image/:id",
  upload.single("profileImage"),
  uploadProfileImage
);

// ADMIN ROUTES
// Update student by ID (Admin)
router.put("/admin/student/:id", updateStudentById);

// Delete student by ID (Admin)
router.delete("/admin/student/:id", deleteStudentById);

// ERROR HANDLING
// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size allowed is 5MB.",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files (JPEG, PNG, GIF) are allowed.",
    });
  }

  next(error);
});

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Student Registration API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
