const express = require("express");
const subTopicController = require("../controller/subTopicController");
const router = express.Router();

// Create a new sub-topic
router.post("/subtopic", subTopicController.createSubTopic);

// Get a sub-topic by ID
router.get("/subtopic/:topicId", subTopicController.getSubTopicsByTopic);

// Update a sub-topic by ID
router.put("/subtopic/:id", subTopicController.updateSubTopic);

// Delete a sub-topic by ID
router.delete("/subtopic/:id", subTopicController.deleteSubTopic);

module.exports = router;
