const User = require("../models/user-modal");
const StudentRegistration = require("../models/StudentRegistration");
const jwt = require("jsonwebtoken");

// ✅ UNIFIED LOGIN - Admin (users) + Student (studentregistrations)
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and password are required",
      });
    }

    console.log("Unified login attempt:", {
      email: email || "Not provided",
      phone: phone || "Not provided",
    });

    // ✅ STEP 1: Check Admin in 'users' collection
    let adminUser = null;
    if (email) {
      adminUser = await User.findOne({
        email: email,
        password: password,
        role: { $in: ["admin", "super_admin"] },
      });
    }

    if (adminUser) {
      console.log(
        "Admin login successful:",
        adminUser.username || adminUser.name
      );
      return res.status(200).json({
        success: true,
        msg: "Login Successful",
        token: jwt.sign(
          {
            userId: adminUser._id,
            email: adminUser.email,
            role: adminUser.role,
          },
          process.env.JWT_SECRET_KEY || "defaultSecretKey",
          { expiresIn: "30d" }
        ),
        role: adminUser.role,
        userId: adminUser._id.toString(),
        userName: adminUser.username || adminUser.name,
      });
    }

    // ✅ STEP 2: Check Student in 'studentregistrations' collection
    let student = null;

    if (email) {
      student = await StudentRegistration.findOne({
        studentEmail: email,
        password: password,
        status: "active",
      });
    } else if (phone) {
      student = await StudentRegistration.findOne({
        studentPhone: phone.replace(/\D/g, ""),
        password: password,
        status: "active",
      });
    }

    if (student) {
      console.log("Student login successful:", student.studentName);

      const token = jwt.sign(
        {
          studentId: student._id,
          studentEmail: student.studentEmail,
          role: "student",
        },
        process.env.JWT_SECRET_KEY || "defaultSecretKey",
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        success: true,
        msg: "Student Login Successful",
        token: token,
        tokenType: "Bearer",
        role: "student",
        student: {
          studentId: student._id.toString(),
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          studentPhone: student.studentPhone,
          course: student.course,
          qualification: student.qualification,
          city: student.city,
          state: student.state,
          registrationNumber: student.registrationNumber,
          fatherName: student.fatherName,
          motherName: student.motherName,
          address: student.address,
          pincode: student.pincode,
        },
      });
    }

    // ✅ No user found in either collection
    console.log("Login failed: Invalid credentials");
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Keep your existing functions
const home = async (req, res) => {
  try {
    res
      .status(200)
      .send(
        "Welcome to the world best mern series by thapa technical using router"
      );
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(400).json({ message: "email already exists" });
    }

    const userCreated = await User.create({ username, email, phone, password });

    res.status(201).json({
      msg: "Registration Successful",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

const user = async (req, res) => {
  try {
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from the user route ${error}`);
  }
};

module.exports = { home, register, login, user };
