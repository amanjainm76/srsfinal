// controllers/auth/authController.js
const StudentRegistration = require("../../models/StudentRegistration");
const jwt = require("jsonwebtoken");

// Simple OTP store (Production में Redis use करें)
const otpStore = new Map();

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

// ✅ Email/Password Login (FIXED - No validation on save)
const loginWithPassword = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    console.log("🔍 Login attempt with:", {
      identifier,
      passwordLength: password?.length,
      rememberMe,
    });

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }

    // Find student with password field included
    let student;

    // Try email first
    student = await StudentRegistration.findOne({
      studentEmail: identifier.toLowerCase(),
    }).select("+password");

    console.log("📧 Email search result:", student ? "Found" : "Not found");

    // If not found by email, try phone
    if (!student) {
      const cleanPhone = identifier.replace(/\D/g, "");
      student = await StudentRegistration.findOne({
        studentPhone: cleanPhone,
      }).select("+password");

      console.log("📱 Phone search result:", student ? "Found" : "Not found");
    }

    if (!student) {
      console.log("❌ Student not found");
      return res.status(400).json({
        success: false,
        message: "Student not found with this email/phone",
      });
    }

    console.log("✅ Student found:", {
      id: student._id,
      name: student.studentName,
      email: student.studentEmail,
      phone: student.studentPhone,
      status: student.status,
      hasPassword: !!student.password,
      isLocked: student.isAccountLocked,
    });

    // Check if password exists in database
    if (!student.password) {
      console.log("❌ Password field missing in database");
      return res.status(400).json({
        success: false,
        message: "Account password not set. Please contact administration.",
      });
    }

    // Check if account is locked
    if (
      student.isAccountLocked ||
      (student.lockUntil && student.lockUntil > Date.now())
    ) {
      console.log("❌ Account is locked");
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed attempts. Please try again later.",
        isLocked: true,
      });
    }

    // Check if account is active
    if (student.status !== "active") {
      console.log("❌ Account not active, status:", student.status);
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact administration.",
      });
    }

    // Compare password using existing method
    console.log("🔐 Comparing passwords...");
    const isMatch = await student.comparePassword(password);
    console.log("🔐 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      // Increment login attempts using existing method
      if (student.incrementLoginAttempts) {
        await student.incrementLoginAttempts();
      }
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    console.log("✅ Login successful!");

    // Reset login attempts on successful login using existing method
    if (student.resetLoginAttempts) {
      await student.resetLoginAttempts();
    }

    // ✅ FIXED: Update last login WITHOUT triggering validation
    try {
      const currentDate = new Date();
      const formattedDate = formatDate();

      // Use updateOne to avoid validation
      await StudentRegistration.updateOne(
        { _id: student._id },
        {
          $set: {
            lastLogin: currentDate,
            lastLoginFormatted: formattedDate,
          },
        }
      );

      console.log("✅ Last login updated successfully");
    } catch (updateError) {
      console.log(
        "⚠️ Warning: Could not update last login time:",
        updateError.message
      );
      // Don't fail login if last login update fails
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "1d";
    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.studentEmail,
        phone: student.studentPhone,
        registrationNumber: student.registrationNumber,
        type: "student",
      },
      process.env.JWT_SECRET_KEY || "SRSEDUCARES",
      { expiresIn: tokenExpiry }
    );

    console.log("✅ JWT token generated successfully");

    // Return success response (password excluded by model's toJSON)
    res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.studentName,
        email: student.studentEmail,
        phone: student.studentPhone,
        registrationNumber: student.registrationNumber,
        course: student.course,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ Send OTP for Phone Login
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log("📱 OTP request for phone:", phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    console.log("📱 Clean phone number:", cleanPhone);

    // Find student by phone
    const student = await StudentRegistration.findOne({
      studentPhone: cleanPhone,
      status: "active",
    });

    console.log("🔍 Student found for OTP:", student ? "Yes" : "No");

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Phone number not registered or account inactive",
      });
    }

    // Check if account is locked
    if (
      student.isAccountLocked ||
      (student.lockUntil && student.lockUntil > Date.now())
    ) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory with 5 minute expiry
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(cleanPhone, { otp, expiresAt });

    // Clear expired OTPs
    setTimeout(() => {
      otpStore.delete(cleanPhone);
    }, 5 * 60 * 1000);

    console.log(`📱 OTP generated for ${cleanPhone}: ${otp}`); // Development only

    res.json({
      success: true,
      message: "OTP sent successfully to your registered phone number",
      // For development only - remove in production
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ OTP send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// ✅ Verify OTP and Login (FIXED - No validation on save)
const verifyOTPLogin = async (req, res) => {
  try {
    const { phone, otp, rememberMe } = req.body;

    console.log("🔐 OTP verification attempt:", {
      phone,
      otp,
      rememberMe,
    });

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");

    // Verify OTP
    const storedOTPData = otpStore.get(cleanPhone);
    console.log("🔍 Stored OTP data:", storedOTPData ? "Found" : "Not found");

    if (!storedOTPData || Date.now() > storedOTPData.expiresAt) {
      console.log("❌ OTP expired or not found");
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (storedOTPData.otp !== otp) {
      console.log("❌ Invalid OTP provided");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    console.log("✅ OTP verified successfully");

    // Find student
    const student = await StudentRegistration.findOne({
      studentPhone: cleanPhone,
      status: "active",
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found or account inactive",
      });
    }

    // Clear OTP
    otpStore.delete(cleanPhone);
    console.log("🗑️ OTP cleared from store");

    // ✅ FIXED: Update last login WITHOUT triggering validation
    try {
      const currentDate = new Date();
      const formattedDate = formatDate();

      // Use updateOne to avoid validation
      await StudentRegistration.updateOne(
        { _id: student._id },
        {
          $set: {
            lastLogin: currentDate,
            lastLoginFormatted: formattedDate,
          },
        }
      );

      console.log("✅ Last login updated successfully");
    } catch (updateError) {
      console.log(
        "⚠️ Warning: Could not update last login time:",
        updateError.message
      );
      // Don't fail login if last login update fails
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "1d";
    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.studentEmail,
        phone: student.studentPhone,
        registrationNumber: student.registrationNumber,
        type: "student",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: tokenExpiry }
    );

    console.log("✅ OTP login successful");

    res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.studentName,
        email: student.studentEmail,
        phone: student.studentPhone,
        registrationNumber: student.registrationNumber,
        course: student.course,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// ✅ Logout (Clear token from client side)
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

module.exports = {
  loginWithPassword,
  sendOTP,
  verifyOTPLogin,
  logout,
};
