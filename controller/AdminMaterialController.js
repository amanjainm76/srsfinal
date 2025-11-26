// controllers/admin/AdminMaterialController.js
const StudyMaterial = require("../models/StudyMaterialModel");
const path = require("path");
const fs = require("fs");

exports.uploadMaterial = async (req, res) => {
  try {
    const { materialType, course, subject, topic, title, description } =
      req.body;

    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // Validate required fields
    if (!materialType || !course || !subject || !topic || !title) {
      if (req.file) fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "All fields are required",
        received: {
          materialType: !!materialType,
          course: !!course,
          subject: !!subject,
          topic: !!topic,
          title: !!title,
          file: !!req.file,
        },
      });
    }

    // Create material
    const newMaterial = new StudyMaterial({
      materialType: materialType.toLowerCase(),
      course: course.toLowerCase(),
      subject: subject.toLowerCase(),
      topic,
      title,
      description: description || "",
      filePath: `/uploads/study-materials/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedOn: new Date(),
    });

    await newMaterial.save();

    console.log("✅ Material uploaded successfully:", newMaterial._id);

    res.status(201).json({
      success: true,
      message: "Material uploaded successfully",
      material: newMaterial,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);

    res.status(500).json({
      success: false,
      message: "Failed to upload material",
      error: error.message,
    });
  }
};

/**
 * Get All Materials (Admin View)
 * GET /api/admin/materials
 */
exports.getAllMaterials = async (req, res) => {
  try {
    const {
      materialType,
      course,
      subject,
      search,
      page = 1,
      limit = 25,
    } = req.query;

    // Build filter
    let filter = {};

    if (materialType && materialType !== "all") {
      filter.materialType = materialType;
    }

    if (course && course !== "all") {
      filter.course = course.toLowerCase();
    }

    if (subject && subject !== "all") {
      filter.subject = subject.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const materials = await StudyMaterial.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ uploadedOn: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await StudyMaterial.countDocuments(filter);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      materials,
    });
  } catch (error) {
    console.error("Fetch materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

/**
 * Get Single Material
 * GET /api/admin/materials/:id
 */
exports.getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get material",
      error: error.message,
    });
  }
};

/**
 * Update Material
 * PUT /api/admin/materials/:id
 */
exports.updateMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      materialType,
      course,
      subject,
      isActive,
    } = req.body;
    const { id } = req.params;

    console.log("📤 Updating material:", id);
    console.log("📋 Received data:", {
      title,
      description,
      topic,
      materialType,
      course,
      subject,
      isActive,
      hasFile: !!req.file,
    });

    // Find material
    const material = await StudyMaterial.findById(id);

    if (!material) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("❌ Material not found:", id);

      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    console.log("✅ Material found, proceeding with update");

    // ✅ Prepare update data
    const updateData = {
      title: title || material.title,
      description: description || material.description,
      topic: topic || material.topic,
      materialType: materialType
        ? materialType.toLowerCase()
        : material.materialType,
      course: course ? course.toLowerCase() : material.course,
      subject: subject ? subject.toLowerCase() : material.subject,
      isActive: isActive !== undefined ? isActive : material.isActive,
    };

    console.log("📝 Update data prepared:", updateData);

    // ✅ If new file uploaded
    if (req.file) {
      console.log("📁 New file detected");
      // ... file handling code ...
    }

    // ✅ Update in database
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("✅ Database update complete");
    console.log("📊 Updated material:", updatedMaterial);

    // ✅ Send response
    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      material: updatedMaterial,
    });

    console.log("📤 Response sent to client");
  } catch (error) {
    console.error("❌ Update error:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("⚠️ Error deleting file:", deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update material",
      error: error.message,
    });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Delete file from server
    const filePath = path.join(__dirname, "../..", material.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await StudyMaterial.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message,
    });
  }
};

/**
 * Get Material Statistics
 * GET /api/admin/materials/stats
 */
exports.getMaterialStats = async (req, res) => {
  try {
    const stats = await StudyMaterial.aggregate([
      {
        $group: {
          _id: null,
          totalMaterials: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalDownloads: { $sum: "$downloadCount" },
          avgFileSize: { $avg: "$fileSize" },
        },
      },
    ]);

    const byType = await StudyMaterial.aggregate([
      {
        $group: {
          _id: "$materialType",
          count: { $sum: 1 },
        },
      },
    ]);

    const byCourse = await StudyMaterial.aggregate([
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {},
      byType,
      byCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message,
    });
  }
};
