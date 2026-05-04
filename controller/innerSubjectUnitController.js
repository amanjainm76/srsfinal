const mongoose = require("mongoose");
const Subject = require("../models/subject-modal");
const InnerSubjectUnit = require("../models/inner-subjectUnit-modal");

// ✅ Helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Create Unit
const createInnerSubjectUnit = async (req, res) => {
  try {
    let { subject, title, content, url, active } = req.body;

    // 🔥 Validation
    if (!subject || !title || !content || !url) {
      return res.status(400).json({
        success: false,
        message: "Subject, title, content and URL are required",
      });
    }

    // ✅ Validate subject ID
    if (!isValidObjectId(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // ✅ Check subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // ✅ content must be array
    if (!Array.isArray(content)) {
      content = [content];
    }

    const newUnit = new InnerSubjectUnit({
      subject, // ✅ direct reference
      title,
      content,
      url,
      active,
      createdOn: new Date(),   // ✅ ADD THIS
      updatedOn: new Date(),   // ✅ ADD THIS
    });

    const saved = await newUnit.save();

    res.status(201).json({
      success: true,
      data: saved,
    });

  } catch (error) {
    console.error("Create Unit Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create unit",
      error: error.message,
    });
  }
};

// ✅ Get Units by Subject
const getInnerSubjectUnitsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!isValidObjectId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    const units = await InnerSubjectUnit.find({ subject: subjectId })
      .populate("subject", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: units,
    });

  } catch (error) {
    console.error("Fetch Units Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch units",
      error: error.message,
    });
  }
};

// ✅ Get All Units (optional filter)
const getAllInnerSubjectUnits = async (req, res) => {
  try {
    const { subject } = req.query;

    let filter = { active: true };

    if (subject && isValidObjectId(subject)) {
      filter.subject = subject;
    }

    const units = await InnerSubjectUnit.find(filter)
      .select("_id title subject")
      .populate("subject", "title")
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      data: units,
    });

  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch units",
      error: error.message,
    });
  }
};

// ✅ Update Unit
const updateInnerSubjectUnit = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, url, content, subject, active } = req.body;

    // ✅ Validate subject if updating
    if (subject && !isValidObjectId(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // ✅ Normalize content
    if (content && !Array.isArray(content)) {
      content = [content];
    }

    const updated = await InnerSubjectUnit.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        subject,
        active,
      },
      { new: true }
    ).populate("subject", "title");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating unit",
      error: error.message,
    });
  }
};

// ✅ Delete Unit
const deleteInnerSubjectUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await InnerSubjectUnit.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting unit",
      error: error.message,
    });
  }
};

module.exports = {
  createInnerSubjectUnit,
  getInnerSubjectUnitsBySubject,
  getAllInnerSubjectUnits,
  updateInnerSubjectUnit,
  deleteInnerSubjectUnit,
};