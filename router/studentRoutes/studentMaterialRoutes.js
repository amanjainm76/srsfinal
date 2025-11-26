// routes/student/studentMaterialRoutes.js
const express = require("express");
const router = express.Router();

const {
  getStudentMaterials,
  downloadMaterial,
  viewMaterial,
} = require("../../controller/student/StudentMaterialController");

const { verifyStudentToken } = require("../../middleware/authMiddleware");

// Apply student authentication to all routes
router.use(verifyStudentToken);

// GET /api/student/materials - Remove duplicate middleware
router.get("/", getStudentMaterials);

// GET /api/student/materials/download/:id
router.get("/download/:id", downloadMaterial);

// GET /api/student/materials/view/:id
router.get("/view/:id", viewMaterial);

module.exports = router;
