const express = require("express");
const router = express.Router();
const topicController = require("../controller/topicController"); // Adjust path based on your file structure

// GET: Fetch filtered topics based on query parameters
router.get("/topic", topicController.getFilteredTopics);

// Create a new topic
router.post("/topic", topicController.createTopic);

// Get all topics
router.get("/topic", topicController.getAllTopics);

// Get a single topic by ID
router.get("/topic/:id", topicController.getTopicById);

// Update a topic by ID
router.put("/topic/:id", topicController.updateTopic);

// Delete a topic by ID
router.delete("/topic/:id", topicController.deleteTopic);

// Add a sub-topic to a specific unit within a topic
router.put("/:topicId/units/:unitTitle/subtopics", topicController.addSubTopic);

module.exports = router;
