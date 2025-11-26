const express = require("express");
const router = express.Router();
const markingSchemesController = require("../controller/markingSchemesController");

// Create a new marking scheme
router.post("/markingSchemes", markingSchemesController.createMarkingScheme);

// Get all marking schemes
router.get("/markingSchemes", markingSchemesController.getMarkingSchemes);

// Get a specific marking scheme by ID
router.get(
  "/markingSchemes/:id",
  markingSchemesController.getMarkingSchemeById
);

// Update a marking scheme by ID
router.put("/markingSchemes/:id", markingSchemesController.updateMarkingScheme);

// Delete a marking scheme by ID
router.delete(
  "/markingSchemes/:id",
  markingSchemesController.deleteMarkingScheme
);

module.exports = router;
