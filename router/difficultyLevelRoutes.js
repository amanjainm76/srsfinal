const express = require("express");
const router = express.Router();

// Correct the path to match the file name
const difficultyLevelController = require("../controller/difficultyLevelController");

// Route to create a difficulty Level
router.post(
  "/difficultyLevel",
  difficultyLevelController.createDifficultyLevel
);

// Route to get all difficulty Levels
router.get(
  "/difficultyLevels",
  difficultyLevelController.getAllDifficultyLevel
);

// Route to get a difficulty Level by ID
router.get(
  "/difficultyLevel/:id",
  difficultyLevelController.getDifficultyLevelById
);

// Route to update a difficulty Level by ID
router.put(
  "/difficultyLevel/:id",
  difficultyLevelController.updateDifficultyLevel
);

// Route to delete a difficulty Level by ID
router.delete(
  "/difficultyLevel/:id",
  difficultyLevelController.deleteDifficultyLevel
);

module.exports = router;
