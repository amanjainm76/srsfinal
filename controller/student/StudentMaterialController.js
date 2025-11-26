// controllers/student/StudentMaterialController.js
const StudyMaterial = require("../../models/StudyMaterialModel");
const StudentRegistration = require("../../models/StudentRegistration");
const path = require("path"); // ✅ ADD THIS
const fs = require("fs"); // ✅ ADD THIS

exports.getStudentMaterials = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await StudentRegistration.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log("✅ Student course:", student.course);

    const materials = await StudyMaterial.find({
      course: { $regex: student.course, $options: "i" }, // Case-insensitive
      isActive: true,
    }).lean();

    console.log("✅ Materials found:", materials.length);

    const groupedMaterials = {
      "study-material": [],
      exercise: [],
      race: [],
      "special-booklet": [],
      "class-notes": [],
    };

    materials.forEach(material => {
      const type = material.materialType;
      if (groupedMaterials.hasOwnProperty(type)) {
        groupedMaterials[type].push({
          _id: material._id,
          name: material.title,
          uploadedOn: material.uploadedOn,
          subject: material.subject,
          topic: material.topic,
          description: material.description,
          fileName: material.fileName,
          fileSize: material.fileSize,
        });
      }
    });

    res.status(200).json({
      success: true,
      student: {
        name: student.studentName,
        email: student.studentEmail,
        course: student.course,
      },
      totalMaterials: materials.length,
      groupedMaterials,
    });

    console.log("✅ Response sent\n");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
    });
  }
};

exports.downloadMaterial = async (req, res) => {
  try {
    const studentId = req.user._id;
    const materialId = req.params.id;

    const student = await StudentRegistration.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const material = await StudyMaterial.findById(materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    material.downloadCount += 1;
    await material.save();

    const filePath = path.join(__dirname, "../..", material.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filePath, material.fileName);
  } catch (error) {
    console.error("Download Controller Error:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Failed to download material",
      error: error.message,
    });
  }
};

exports.viewMaterial = async (req, res) => {
  try {
    const studentId = req.user._id;
    const materialId = req.params.id;

    const student = await StudentRegistration.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    material.viewCount += 1;
    await material.save();

    const filePath = path.join(__dirname, "../..", material.filePath);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${material.fileName}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("View Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to view material",
    });
  }
};
