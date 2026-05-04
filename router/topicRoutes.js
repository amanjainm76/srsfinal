const express = require("express");
const router = express.Router();
const topicController = require("../controller/topicController");


router.get("/unit/:unitId", topicController.getTopicsByUnit);

// ==============================
// ✅ GET ALL TOPICS
// ==============================
router.get("/topic", topicController.getAllTopics);

// ==============================
// ✅ FILTER TOPICS (separate route)
// ==============================
router.get("/topic/filter", topicController.getFilteredTopics);

// ==============================
// ✅ CREATE
// ==============================
router.post("/topic", topicController.createTopic);

// ==============================
// ✅ GET SINGLE
// ==============================
router.get("/topic/:id", topicController.getTopicById);

// ==============================
// ✅ UPDATE
// ==============================
router.put("/topic/:id", topicController.updateTopic);

// ==============================
// ✅ DELETE
// ==============================
router.delete("/topic/:id", topicController.deleteTopic);

router.get("/topics/independent", topicController.getAllTopicsIndependent);

module.exports = router;