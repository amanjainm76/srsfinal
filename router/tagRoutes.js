const express = require("express");
const router = express.Router();
const tagController = require("../controller/tagController"); // Adjust path if needed

// Route to create a new tag
router.post("/tags", tagController.createTag);

// Route to get all tags
router.get("/tags", tagController.getTag);

// Route to get a tag by ID
router.get("/tags/:id", tagController.getTagById);

// Route to update a tag by ID
router.put("/tags/:id", tagController.updateTag);

// Route to delete a tag by ID
router.delete("/tags/:id", tagController.deleteTag);

module.exports = router;
