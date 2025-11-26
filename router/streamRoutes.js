const express = require("express");
const router = express.Router();
const streamController = require("../controller/streamController");

// Route to create a stream
router.post("/streams", streamController.createStream);

// Route to get all streams
router.get("/streams", streamController.getStreams);

// Route to get a single stream by ID
router.get("/streams/:id", streamController.getStreamById);

// Route to update a stream by ID
router.put("/streams/:id", streamController.updateStream);

// Route to delete a stream by ID
router.delete("/streams/:id", streamController.deleteStream);

module.exports = router;
