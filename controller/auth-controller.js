// controller/auth-controller.js
const Register = require("../models/user-modal");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET_KEY || "SRSEDUCARES";

// *------------------------
// * Registration Logic
// *------------------------
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      city,
      password,
      userClass,
      userStream,
      userCourse,
      isAdmin,
    } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check existing user
    const userExistByEmail = await Register.findOne({ email });
    if (userExistByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const userExistByPhone = await Register.findOne({ phone });
    if (userExistByPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userCreated = await Register.create({
      username,
      email,
      phone,
      city,
      password: hashedPassword,
      userClass,
      userStream,
      userCourse,
      isAdmin: isAdmin === true ? true : false,
    });

    // Generate token using model method
    const token = userCreated.generateToken();

    console.log("✅ User registered:", {
      userId: userCreated._id,
      email: userCreated.email,
      isAdmin: userCreated.isAdmin,
    });

    res.status(201).json({
      success: true,
      msg: "Registration Successful",
      token,
      userId: userCreated._id.toString(),
      email: userCreated.email,
      username: userCreated.username,
      isAdmin: userCreated.isAdmin,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// *------------------------
// * Login Logic
// *------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const userExist = await Register.findOne({ email }).select("+password");
    if (!userExist) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordValid = await userExist.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token using model method
    const token = userExist.generateToken();

    console.log("✅ Login successful:", {
      userId: userExist._id,
      email: userExist.email,
      isAdmin: userExist.isAdmin,
    });

    res.status(200).json({
      success: true,
      msg: "Login Successful",
      token,
      userId: userExist._id.toString(),
      email: userExist.email,
      username: userExist.username,
      isAdmin: userExist.isAdmin,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { register, login };
