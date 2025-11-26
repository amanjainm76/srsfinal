// routes/auth/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  loginWithPassword,
  sendOTP,
  verifyOTPLogin,
  logout,
} = require("../../controller/auth/authController");

// ✅ Student Login Routes
router.post("/login", loginWithPassword); // Email/Password login
router.post("/send-otp", sendOTP); // Send OTP to phone
router.post("/verify-otp", verifyOTPLogin); // Verify OTP and login
router.post("/logout", logout); // Logout

module.exports = router;
