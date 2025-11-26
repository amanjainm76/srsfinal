// routes/admin/adminMaterialRoutes.js
const express = require("express");
const router = express.Router();

const {
  uploadMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getMaterialStats,
} = require("../controller/AdminMaterialController");

const { verifyAdminToken } = require("../middleware/authMiddleware");
const {
  uploadPDF,
  handleUploadError,
} = require("../middleware/uploadMiddleware");

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// POST /api/admin/materials/upload
router.post("/upload", uploadPDF, handleUploadError, uploadMaterial);

// GET /api/admin/materials
router.get("/", getAllMaterials);

// GET /api/admin/materials/stats
router.get("/stats", getMaterialStats);

// GET /api/admin/materials/:id
router.get("/:id", getMaterialById);

// PUT /api/admin/materials/:id
router.put("/:id", uploadPDF, handleUploadError, updateMaterial);

router.delete("/:id", deleteMaterial);

module.exports = router;
