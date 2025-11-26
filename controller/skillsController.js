const Skills = require("../models/skills-modal"); // Adjust path if needed

// Create a new skills
const skillsStream = async (req, res) => {
  const { title, url, content, createdOn, updatedOn, active } = req.body;

  try {
    const newSkills = new Skills({
      title,
      url,
      content,
      createdBy: "super admin", // Automatically assigned on creation
      createdOn,
      updatedBy: "super admin", // Automatically assigned on creation
      updatedOn,
      active,
    });

    const savedSkills = await newSkills.save();
    res.status(201).json(savedSkills);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating skills", error: error.message });
  }
};

// Get all skills
const getSkills = async (req, res) => {
  try {
    const skills = await Skills.find();
    res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching skills", error: error.message });
  }
};

// Get a skills by ID
const getSkillsById = async (req, res) => {
  const { id } = req.params;

  try {
    const skills = await Skills.findById(id);
    if (!skills) {
      return res.status(404).json({ message: "Skills not found" });
    }
    res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching Skills", error: error.message });
  }
};

// Update a skills by ID
const updateSkills = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, updatedBy, updatedOn, active } = req.body;

  try {
    const updatedSkills = await Skills.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        updatedBy: updatedBy || "super admin", // Default to "super admin" if not provided
        updatedOn,
        active,
      },
      { new: true } // Return the updated skills
    );

    if (!updatedSkills) {
      return res.status(404).json({ message: "Skills not found" });
    }

    res.status(200).json(updatedSkills); // Return the updated skills
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating skills", error: error.message });
  }
};

// Delete a skills by ID
const deleteSkills = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSkills = await Skills.findByIdAndDelete(id);
    if (!deletedSkills) {
      return res.status(404).json({ message: "Skills not found" });
    }
    res
      .status(200)
      .json({ message: "Skills deleted successfully", deletedSkills });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Skills", error: error.message });
  }
};

module.exports = {
  skillsStream, // Fixed the function names
  getSkills,
  getSkillsById,
  updateSkills,
  deleteSkills,
};
