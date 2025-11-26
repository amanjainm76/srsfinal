const DifficultyLevel = require("../models/difficulty-level-modal");

// Create Difficulty Level
const createDifficultyLevel = async (req, res) => {
  const { title, description, createdOn, updatedOn, active } = req.body;

  try {
    const newDifficultyLevel = new DifficultyLevel({
      title,
      description,
      createdBy: "superadmin",
      createdOn,
      updatedBy: "superadmin",
      updatedOn,
      active,
    });

    const savedDifficultyLevel = await newDifficultyLevel.save();
    res.status(201).json(savedDifficultyLevel); // Respond with the created Difficulty Level
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error creating Difficulty Level",
        error: error.message,
      });
  }
};

// Get all Difficulty Levels
const getAllDifficultyLevel = async (req, res) => {
  try {
    const difficultyLevels = await DifficultyLevel.find();
    res.status(200).json(difficultyLevels); // Respond with the list of Difficulty Levels
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error fetching Difficulty Levels",
        error: error.message,
      });
  }
};

// Get a single Difficulty Level by ID
const getDifficultyLevelById = async (req, res) => {
  const { id } = req.params;

  try {
    const difficultyLevel = await DifficultyLevel.findById(id);
    if (!difficultyLevel) {
      return res.status(404).json({ message: "Difficulty Level not found" });
    }
    res.status(200).json(difficultyLevel); // Respond with the specific Difficulty Level
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error fetching Difficulty Level",
        error: error.message,
      });
  }
};

// Update a Difficulty Level by ID
const updateDifficultyLevel = async (req, res) => {
  const { id } = req.params;
  const { title, description, updatedBy, updatedOn, active } = req.body;

  try {
    const updatedDifficultyLevel = await DifficultyLevel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        updatedBy: updatedBy || "superadmin", // Default to 'superadmin' if not provided
        updatedOn,
        active,
      },
      { new: true } // Return the updated document
    );

    if (!updatedDifficultyLevel) {
      return res.status(404).json({ message: "Difficulty Level not found" });
    }

    res.status(200).json(updatedDifficultyLevel); // Respond with the updated Difficulty Level
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error updating Difficulty Level",
        error: error.message,
      });
  }
};

// Delete a Difficulty Level by ID
const deleteDifficultyLevel = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDifficultyLevel = await DifficultyLevel.findByIdAndDelete(id);
    if (!deletedDifficultyLevel) {
      return res.status(404).json({ message: "Difficulty Level not found" });
    }

    res.status(200).json({ message: "Difficulty Level deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error deleting Difficulty Level",
        error: error.message,
      });
  }
};

module.exports = {
  createDifficultyLevel,
  getAllDifficultyLevel,
  getDifficultyLevelById,
  updateDifficultyLevel,
  deleteDifficultyLevel,
};
