const SubTopic = require("../models/sub-topic-modal");
const mongoose = require("mongoose");

// ==============================
// ✅ CREATE SUBTOPIC
// ==============================
const createSubTopic = async (req, res) => {
  try {
    const { topicId, title, content, url, active } = req.body;

    console.log("REQ BODY:", req.body);

    // ✅ VALIDATION
    if (!topicId || !title || !content || !url) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ message: "Invalid topicId format" });
    }

    // ✅ CREATE
    const newSubTopic = new SubTopic({
      title,
      url,
      content: Array.isArray(content) ? content : [content],
      topic: topicId, // ✅ MAIN FIX
      createdBy: "superadmin",
      updatedBy: "superadmin",
      active: active ?? true,
    });

    const savedSubTopic = await newSubTopic.save();

    res.status(201).json({
      success: true,
      message: "SubTopic created successfully",
      data: savedSubTopic,
    });
  } catch (error) {
    console.error("Error creating SubTopic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create SubTopic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ GET SUBTOPICS BY TOPIC
// ==============================
const getSubTopicsByTopic = async (req, res) => {
  const { topicId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ message: "Invalid topicId" });
    }

    const subTopics = await SubTopic.find({ topic: topicId });

    res.status(200).json({
      success: true,
      data: subTopics,
    });
  } catch (error) {
    console.error("Error fetching SubTopics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SubTopics",
      error: error.message,
    });
  }
};

// ==============================
// ✅ UPDATE
// ==============================
const updateSubTopic = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, active } = req.body;

  try {
    const updated = await SubTopic.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content: Array.isArray(content) ? content : [content],
        updatedOn: new Date(),
        active,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "SubTopic not found" });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating sub topic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ DELETE
// ==============================
const deleteSubTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await SubTopic.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "SubTopic not found" });
    }

    res.status(200).json({
      success: true,
      message: "SubTopic deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting SubTopic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ GET ALL SUBTOPICS
// ==============================
const getAllSubTopics = async (req, res) => {
  try {
    const subTopics = await SubTopic.find().populate("topic", "title");

    res.status(200).json({
      success: true,
      data: subTopics,
    });
  } catch (error) {
    console.error("Error fetching all subtopics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subtopics",
      error: error.message,
    });
  }
};

module.exports = {
  createSubTopic,
  getSubTopicsByTopic,
  updateSubTopic,
  deleteSubTopic,
  getAllSubTopics,
};