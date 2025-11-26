// middleware/studentAuth.js
const jwt = require("jsonwebtoken");

const authenticateStudent = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "student-secret-key"
    );

    // Check if it's a student role
    if (decoded.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Student auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticateStudent };
