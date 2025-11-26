const Topic = require("../models/topic-modal"); // Adjust path based on your file structure

// Create a new Topic

const createTopic = async (req, res) => {
  const {
    title,
    url,
    content,
    units,
    createdBy,
    updatedBy,
    createdOn,
    updatedOn,
    active,
  } = req.body;

  try {
    const newTopic = new Topic({
      title,
      url,
      content,
      units,
      createdBy,
      createdOn,
      updatedBy,
      updatedOn,
      active,
    });

    // Save the new topic to the database
    const savedTopic = await newTopic.save();

    res.status(201).json(savedTopic); // Respond with the saved topic
  } catch (error) {
    console.error("Error creating topic:", error);
    res
      .status(500)
      .json({ message: "Error creating topic", error: error.message });
  }
};

module.exports = { createTopic };

// Get all Topics
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch topics", error: error.message });
  }
};

// Get a single Topic by ID
const getTopicById = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch topic", error: error.message });
  }
};

// Update a Topic by ID

const updateTopic = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, units, updatedOn, active } = req.body;

  try {
    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        units,
        updatedOn,
        active,
      },
      { new: true } // Return the updated stream
    );

    if (!updatedTopic) {
      return res.status(404).json({ message: "Topics not found" });
    }

    res.status(200).json(updatedTopic); // Return the updated stream
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating topics", error: error.message });
  }
};

// Delete a Topic by ID
const deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTopics = await Topic.findByIdAndDelete(id);
    if (!deletedTopics) {
      return res.status(404).json({ message: "Sub Topics not found" });
    }
    res
      .status(200)
      .json({ message: "Topics deleted successfully", deletedTopics });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting  Topics", error: error.message });
  }
};

// Add a sub-topic to a specific unit
const addSubTopic = async (req, res) => {
  const { topicId, unitTitle } = req.params;
  const { subTitle } = req.body;

  try {
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const unit = topic.units.find(u => u.unitTitle === unitTitle);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    unit.subTopics.push({ subTitle });
    await topic.save();

    res.status(200).json({ message: "Sub-topic added successfully", topic });
  } catch (error) {
    console.error("Error adding sub-topic:", error);
    res
      .status(500)
      .json({ message: "Failed to add sub-topic", error: error.message });
  }
};

// Search and Filter Topics API
// Search and Filter Topics API (with unitTitle filter)
const getFilteredTopics = async (req, res) => {
  try {
    // Extract query parameters (category, search, active, unitTitle)
    const { category, search, active, unitTitle } = req.query;

    // Initialize filter object
    let filter = {};

    // If category is provided, filter by category
    if (category) {
      filter.category = category;
    }

    // If search is provided, filter by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: "i" }; // Case-insensitive search for title
    }

    // If active status is provided, filter by active (true/false)
    if (active !== undefined) {
      filter.active = active === "true"; // Convert string to boolean
    }

    // If unitTitle is provided, filter topics by unitTitle
    if (unitTitle) {
      filter["units.unitTitle"] = { $regex: unitTitle, $options: "i" }; // Case-insensitive search for unitTitle
    }

    // Fetch topics from the database based on the filter
    const topics = await Topic.find(filter);

    // Respond with the filtered topics
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Error fetching topics" });
  }
};

module.exports = {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  addSubTopic,
  getFilteredTopics,
};
