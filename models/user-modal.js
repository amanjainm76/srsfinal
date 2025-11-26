// models/user-modal.js (या user-model.js)
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [2, "Username must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    unique: true,
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // ✅ Don't return password by default
  },
  userClass: {
    type: String,
    required: [true, "Class is required"],
    trim: true,
  },
  userStream: {
    type: String,
    required: [true, "Stream is required"],
    trim: true,
  },
  userCourse: {
    type: String,
    required: [true, "Course is required"],
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // ✅ New fields for tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ JWT generation function with proper secret
userSchema.methods.generateToken = function () {
  try {
    const JWT_SECRET = process.env.JWT_SECRET_KEY || "SRSEDUCARES";

    return jwt.sign(
      {
        userId: this._id.toString(),
        id: this._id.toString(),
        email: this.email,
        username: this.username,
        isAdmin: this.isAdmin,
        role: this.isAdmin ? "admin" : "student",
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
  } catch (e) {
    console.error("Token generation error:", e);
    throw new Error("Error generating token");
  }
};

// ✅ Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// ✅ Pre-save middleware to hide password
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("registers", userSchema);

module.exports = User;
