const express = require("express");
const router = express.Router();
const guidelineController = require("../controller/guideline-controller"); // Assuming your controller is in the 'controllers' folder

// Create a new guideline
router.post("/guidelines", guidelineController.createGuideline);

// Get all guidelines
router.get("/guidelines", guidelineController.getAllGuidelines);

// Get a single guideline by ID
router.get("/guidelines/:id", guidelineController.getGuidelineById);

// Update a guideline by ID
router.put("/guidelines/:id", guidelineController.updateGuidelineById);

// Delete a guideline by ID
router.delete("/guidelines/:id", guidelineController.deleteGuidelineById);

// Toggle the active status of a guideline
router.patch(
  "/guidelines/:id/toggle-active",
  guidelineController.toggleActiveStatus
);

module.exports = router;
