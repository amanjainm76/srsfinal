const mongoose = require("mongoose");
const Topic = require("../models/topic-modal");

// ==============================
// ✅ CREATE TOPIC
// ==============================
const createTopic = async (req, res) => {
  try {
    const {
      title,
      url,
      content,
      stream,
      subject,
      unit, // ✅ changed
      active,
    } = req.body;

    if (!title || !url || !content || !stream || !subject || !unit) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(stream) ||
      !mongoose.Types.ObjectId.isValid(subject) ||
      !mongoose.Types.ObjectId.isValid(unit) // ✅ validate
    ) {
      return res.status(400).json({
        message: "Invalid IDs",
      });
    }

    const newTopic = new Topic({
      title,
      url,
      content,
      stream,
      subject,
      unit, // ✅ correct field
      createdOn: new Date(),
      updatedOn: new Date(),
      active,
    });

    const savedTopic = await newTopic.save();

    res.status(201).json(savedTopic);

  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({
      message: "Error creating topic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ GET ALL TOPICS
// ==============================
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate("stream", "title")
      .populate("subject", "title") // ⚠️ name nahi, title hai
      .populate("unit", "title");   // ✅ units → unit

    res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      message: "Failed to fetch topics",
      error: error.message,
    });
  }
};

// ==============================
// ✅ GET BY ID
// ==============================
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId)
      .populate("stream", "name")
      .populate("subject", "title")
      .populate("unit", "title content");

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({
      message: "Failed to fetch topic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ UPDATE
// ==============================
const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedOn: new Date().toLocaleString(),
      },
      { new: true }
    );

    if (!updatedTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.status(200).json(updatedTopic);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating topic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ DELETE
// ==============================
const deleteTopic = async (req, res) => {
  try {
    const deleted = await Topic.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.status(200).json({
      message: "Topic deleted successfully",
      deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting topic",
      error: error.message,
    });
  }
};

// ==============================
// ✅ FILTER API
// ==============================
const getFilteredTopics = async (req, res) => {
  try {
    const { search, active, stream, subject } = req.query;

    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    if (stream && mongoose.Types.ObjectId.isValid(stream)) {
      filter.stream = stream;
    }

    if (subject && mongoose.Types.ObjectId.isValid(subject)) {
      filter.subject = subject;
    }

    const topics = await Topic.find(filter)
      .populate("stream", "name")
      .populate("subject", "title")
      .populate("unit", "title");

    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Error fetching topics" });
  }
};

const getAllTopicsIndependent = async (req, res) => {
  try {
    const topics = await Topic.find()
      .select("_id title units") // lightweight response
      .populate("units", "title");

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error("Error fetching all topics (independent):", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
      error: error.message,
    });
  }
};

const getTopicsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID",
      });
    }

    const topics = await Topic.find({ unit: unitId })
      .select("_id title")
      .sort({ createdOn: -1 });

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error("Error fetching topics by unit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
      error: error.message,
    });
  }
};

// ==============================
// ✅ EXPORT (ONLY ONCE 🔥)
// ==============================
module.exports = {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  getFilteredTopics,
  getAllTopicsIndependent,
  getTopicsByUnit,
};