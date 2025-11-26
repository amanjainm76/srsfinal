// router/studentRoutes/studentAuth-router.js
const express = require("express");
const router = express.Router();
const {
  studentLogin,
  getStudentDashboard,
  updateStudentProfile,
  studentLogout,
} = require("../controller/studentAuthController");
const { authenticateStudent } = require("../middleware/studentAuth");

router.post("/login", studentLogin);

router.use(authenticateStudent); // Apply middleware to all routes below

router.get("/dashboard", getStudentDashboard);
router.put("/profile", updateStudentProfile);
router.post("/logout", studentLogout);

module.exports = router;
