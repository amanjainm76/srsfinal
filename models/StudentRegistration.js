// models/student/StudentRegistration.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StudentRegistrationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Student name must be at least 2 characters long"],
      maxlength: [100, "Student name cannot exceed 100 characters"],
    },
    studentEmail: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true, // ✅ Email unique
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      maxlength: [100, "Email cannot exceed 100 characters"],
      index: true, // For faster queries
    },
    studentPhone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true, // ✅ Phone number unique
      match: [/^[+]?[\d\s-()]{10,15}$/, "Please enter a valid phone number"],
      index: true, // For faster queries
    },

    // ✅ Password field
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [128, "Password cannot exceed 128 characters"],
      validate: {
        validator: function (password) {
          // Password must contain at least one number, one letter
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(
            password
          );
        },
        message: "Password must contain at least one letter and one number",
      },
    },

    // ✅ Profile Image Field (Exactly as requested)
    studentprofileImage: {
      type: String,
      default: "/assets/backend-img/user.png",
      trim: true,
      validate: {
        validator: function (v) {
          return (
            v === "/assets/backend-img/user.png" ||
            /^\/uploads\/profile-images\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i.test(
              v
            )
          );
        },
        message: "Invalid image path format",
      },
    },

    course: {
      type: String,
      required: [true, "Course/Stream is required"],
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
      maxlength: [100, "Qualification cannot exceed 100 characters"],
    },
    fatherName: {
      type: String,
      required: [true, "Father name is required"],
      trim: true,
      maxlength: [100, "Father name cannot exceed 100 characters"],
    },
    motherName: {
      type: String,
      required: [true, "Mother name is required"],
      trim: true,
      maxlength: [100, "Mother name cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },

    // ✅ Login tracking fields
    lastLogin: {
      type: Date,
    },
    lastLoginFormatted: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum 5 login attempts allowed"],
    },
    lockUntil: {
      type: Date,
    },
    isAccountLocked: {
      type: Boolean,
      default: false,
    },

    // ✅ Password reset fields
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

    // ✅ Profile creation tracking
    profileCreated: {
      type: Boolean,
      default: false,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      sparse: true,
    },
    profileCreatedOn: {
      type: Date,
    },

    // ✅ Additional metadata
    createdBy: {
      type: String,
      default: "student", // or 'admin', 'import', etc.
    },
    updatedBy: {
      type: String,
    },
    updatedOn: {
      type: String, // Formatted date string
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password; // ✅ Never include password in JSON output
        delete ret.passwordResetToken;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password; // ✅ Never include password in object output
        delete ret.passwordResetToken;
        return ret;
      },
    },
  }
);

// ✅ Hash password before saving
StudentRegistrationSchema.pre("save", async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Generate registration number before saving
StudentRegistrationSchema.pre("save", function (next) {
  if (!this.registrationNumber && this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.registrationNumber = `STU${timestamp.slice(-6)}${random}`;
  }
  next();
});

// ✅ Virtual for full address
StudentRegistrationSchema.virtual("fullAddress").get(function () {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}`;
});

// ✅ Virtual for account lock status
StudentRegistrationSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ✅ Instance method to compare password
StudentRegistrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// ✅ Instance method to increment login attempts
StudentRegistrationSchema.methods.incrementLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
        isAccountLocked: false,
      },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we have max attempts and it's not locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // Lock for 2 hours
      isAccountLocked: true,
    };
  }

  return this.updateOne(updates);
};

// ✅ Instance method to reset login attempts
StudentRegistrationSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
    $set: {
      isAccountLocked: false,
    },
  });
};

// ✅ Static method to find by email or phone
StudentRegistrationSchema.statics.findByEmailOrPhone = function (identifier) {
  return this.findOne({
    $or: [
      { studentEmail: identifier.toLowerCase() },
      { studentPhone: identifier.replace(/\D/g, "") },
    ],
  });
};

// ✅ Indexes for better performance
StudentRegistrationSchema.index({ studentEmail: 1 }, { unique: true });
StudentRegistrationSchema.index({ studentPhone: 1 }, { unique: true });
StudentRegistrationSchema.index({ studentName: 1 });
StudentRegistrationSchema.index(
  { registrationNumber: 1 },
  { unique: true, sparse: true }
);
StudentRegistrationSchema.index({ registrationDate: -1 });
StudentRegistrationSchema.index({ status: 1 });
StudentRegistrationSchema.index({ createdAt: -1 });
StudentRegistrationSchema.index({ lockUntil: 1 }, { sparse: true });
StudentRegistrationSchema.index({ passwordResetToken: 1 }, { sparse: true });

module.exports = mongoose.model(
  "StudentRegistration",
  StudentRegistrationSchema
);
