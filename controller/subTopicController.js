const SubTopic = require("../models/sub-topic-modal");
const Topic = require("../models/topic-modal");
const mongoose = require("mongoose");

// Create a new SubTopic
const createSubTopic = async (req, res) => {
  try {
    const { topicId, title, content, url, createdOn, updatedOn, active } =
      req.body;

    // Validate required fields
    if (!topicId || !title || !content || !url || !createdOn || !updatedOn) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that topicId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ message: "Invalid topicId format" });
    }

    // Create a new SubTopic
    const newSubTopic = new SubTopic({
      title,
      content,
      url,
      createdOn,
      updatedOn,
      active,
    });

    await newSubTopic.save();

    // Find the topic by ObjectId
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Add the new SubTopic to the topic's SubTopics array
    topic.SubTopics.push(newSubTopic._id);

    await topic.save(); // Save the updated topic with the new SubTopic

    res.status(201).json({
      message: "SubTopic created and added to the topic",
      subTopic: newSubTopic,
      topic,
    });
  } catch (error) {
    console.error("Error creating SubTopic:", error);
    res.status(500).json({
      message: "Failed to create SubTopic",
      error: error.message, // Include detailed error message
    });
  }
};

// Get all SubTopics for a specific Topic
const getSubTopicsByTopic = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId).populate("SubTopics");

    if (!topic) {
      return res.status(404).json({ message: "Topic  not found" });
    }

    res.status(200).json(topic.SubTopics);
  } catch (error) {
    console.error("Error fetching Sub Topics :", error);
    res.status(500).json({
      message: "Failed to fetch Sub Topics",
      error: error.message,
    });
  }
};

// Update a SubTopic
const updateSubTopic = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, updatedOn, active } = req.body;

  try {
    const updatedTopics = await SubTopic.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        updatedOn,
        active,
      },
      { new: true } // Return the updated stream
    );

    if (!updatedTopics) {
      return res.status(404).json({ message: "sub topics not found" });
    }

    res.status(200).json(updatedTopics); // Return the updated stream
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating  sub topics", error: error.message });
  }
};

// Delete a SubTopic
const deleteSubTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubTopics = await SubTopic.findByIdAndDelete(id);
    if (!deletedSubTopics) {
      return res.status(404).json({ message: "Sub Topics not found" });
    }
    res
      .status(200)
      .json({ message: "Sub Topics deleted successfully", deletedSubTopics });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Sub Topics", error: error.message });
  }
};

module.exports = {
  createSubTopic,
  getSubTopicsByTopic,
  updateSubTopic,
  deleteSubTopic,
};
