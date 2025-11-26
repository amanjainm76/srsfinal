const jwt = require("jsonwebtoken");
const StudentRegistration = require("../models/StudentRegistration");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET_KEY || "SRSEDUCARES";

console.log("🔑 JWT_SECRET loaded:", JWT_SECRET);

/**
 * Verify Admin Token
 */
// middleware/authMiddleware.js
exports.verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔍 Authorization Header:", authHeader);

    // ✅ Better validation
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided",
      });
    }

    // ✅ Extract token properly
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("❌ Invalid header format:", parts);
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header format",
      });
    }

    const token = parts[1];

    // ✅ Check token is not empty
    if (!token || token.trim() === "") {
      console.log("❌ Token is empty!");
      return res.status(401).json({
        success: false,
        message: "Token is empty",
      });
    }

    console.log(
      "🔐 Token extracted (first 30 chars):",
      token.substring(0, 30) + "..."
    );

    const JWT_SECRET = process.env.JWT_SECRET_KEY || "SRSEDUCARES";
    console.log("🔑 Using secret key:", JWT_SECRET);

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token decoded successfully");
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError.message);
      throw jwtError;
    }

    console.log("✅ Decoded payload:", {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      role: decoded.role,
    });

    // ✅ Check isAdmin
    if (decoded.isAdmin !== true) {
      console.log("❌ Not admin:", decoded.isAdmin);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // ✅ Set user
    req.user = {
      _id: decoded.userId || decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: true,
    };

    console.log("✅ Admin verified, user set");
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid admin token",
      error: error.message,
    });
  }
};

exports.verifyStudentToken = async (req, res, next) => {
  console.log("\n🚀 === MIDDLEWARE HIT ===");
  console.log("📍 Path:", req.path);

  try {
    const authHeader = req.headers.authorization;
    console.log("🔍 Auth Header present:", !!authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.slice(7);
    console.log("✅ Token extracted");

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token verified");
    } catch (jwtError) {
      console.error("❌ JWT Error:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const studentId = decoded.studentId;
    console.log("🆔 studentId from token:", studentId);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "No student ID in token",
      });
    }

    // ✅ Validate if studentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log("❌ Invalid ObjectId format:", studentId);
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    console.log("🔍 Fetching student from DB...");
    const student = await StudentRegistration.findById(studentId);
    console.log("👤 Student found:", !!student);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student not found",
      });
    }

    // ✅ Set req.user
    req.user = {
      _id: student._id.toString(),
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      course: student.course,
    };

    console.log("✅ req.user set");
    console.log("✅ Calling next()\n");

    next();
  } catch (error) {
    console.error("❌ Middleware Error:", error.message);
    console.error("Stack:", error.stack);

    // ✅ Handle validation error
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
