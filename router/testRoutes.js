const express = require("express");
const router = express.Router();
const testController = require("../controller/testController");

// Route to create a test
router.post("/test", testController.createTest);

// Route to get all tests
router.get("/tests", testController.getAllTests);

// Route to get a test by ID
router.get("/test/:id", testController.getTestById);

// Route to update a test by ID
router.put("/test/:id", testController.updateTest);

// Route to delete a test by ID
router.delete("/test/:id", testController.deleteTest);

module.exports = router;
