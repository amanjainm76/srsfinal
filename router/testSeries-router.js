const express = require("express");
const router = express.Router();
const testSeriesController = require("../controller/testSeriesController");

// Route for creating a new test series
router.post("/test-series", testSeriesController.createTestSeries);

// Route for getting all test series
router.get("/test-series", testSeriesController.getTestSeries);

// Route for getting a specific test series by ID
router.get("/test-series/:id", testSeriesController.getTestSeriesById);

// Route for updating a test series by ID
router.put("/test-series/:id", testSeriesController.updateTestSeries);

// Route for deleting a test series by ID
router.delete("/test-series/:id", testSeriesController.deleteTestSeries);

// Route for filtering test series by active status (true/false)
router.get(
  "/test-series/active/:status",
  testSeriesController.getTestSeriesByActiveStatus
);

// Route for searching test series by tags (e.g., 'JS', 'Math')
router.get(
  "/test-series/search/tags/:tag",
  testSeriesController.getTestSeriesByTag
);

// Route for updating the active status of a test series (toggle active/inactive)
router.patch(
  "/test-series/:id/active",
  testSeriesController.updateActiveStatus
);

module.exports = router;
