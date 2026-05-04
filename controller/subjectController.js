const mongoose = require("mongoose");
const Subject = require("../models/subject-modal");

// ✅ Helper: validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Create a new subject
const createSubject = async (req, res) => {
  try {
    let { title, url, content, stream, createdOn, updatedOn, active } = req.body;

    // 🔥 Validation
    if (!title || !url || !content || !stream) {
      return res.status(400).json({
        success: false,
        message: "Title, URL, content and stream are required",
      });
    }

    // ✅ Convert content to array if needed
    if (!Array.isArray(content)) {
      content = [content];
    }

    // ✅ Validate single stream ID
    if (!isValidObjectId(stream)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stream ID",
      });
    }

    const newSubject = new Subject({
      title,
      url,
      content,
      stream, // ✅ single ObjectId
      createdBy: "superadmin",
      createdOn,
      updatedBy: "superadmin",
      updatedOn,
      active,
    });

    const savedSubject = await newSubject.save();

    res.status(201).json({
      success: true,
      data: savedSubject,
    });

  } catch (error) {
    console.error("Create Subject Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subject",
      error: error.message,
    });
  }
};

// ✅ Get all subjects (with optional stream filter)
const getAllSubjects = async (req, res) => {
  try {
    const { stream } = req.query;

    let filter = {};

    // 🔥 filter by stream
    if (stream && isValidObjectId(stream)) {
      filter.stream = stream;
    }

    const subjects = await Subject.find(filter)
      .populate("stream", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subjects,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects",
      error: error.message,
    });
  }
};

// ✅ Get a single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("stream", "name");

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching subject",
      error: error.message,
    });
  }
};

// ✅ Update a subject by ID
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, url, content, stream, active } = req.body;

    // ✅ Convert content to array
    if (content && !Array.isArray(content)) {
      content = [content];
    }

    // ✅ Validate stream
    if (stream && !isValidObjectId(stream)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stream ID",
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        stream,
        active,
        updatedOn: new Date().toISOString(),
      },
      { new: true }
    ).populate("stream", "name");

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubject,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating subject",
      error: error.message,
    });
  }
};

// ✅ Delete a subject by ID
const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting subject",
      error: error.message,
    });
  }
};

// ✅ Dropdown API
const getSubjectsDropdown = async (req, res) => {
  try {
    const { stream } = req.query;

    let filter = {};

    // ✅ FILTER BY STREAM (MOST IMPORTANT FIX)
    if (stream && mongoose.Types.ObjectId.isValid(stream)) {
      filter.stream = stream;
    }

    const subjects = await Subject.find(filter)
      .select("_id title")
      .sort({ title: 1 });

    const formatted = subjects.map((item) => ({
      value: item._id,
      label: item.title,
    }));

    res.json({
      success: true,
      data: formatted,
    });

  } catch (error) {
    console.error("Dropdown Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects",
    });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsDropdown,
};