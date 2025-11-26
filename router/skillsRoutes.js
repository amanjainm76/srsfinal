const express = require("express");
const router = express.Router();
const skillsController = require("../controller/skillsController"); // Adjust the path to where your controller file is

// Route to create a new skill
router.post("/skills", skillsController.skillsStream);

// Route to get all skills
router.get("/skills", skillsController.getSkills);

// Route to get a skill by ID
router.get("/skills/:id", skillsController.getSkillsById);

// Route to update a skill by ID
router.put("/skills/:id", skillsController.updateSkills);

// Route to delete a skill by ID
router.delete("/skills/:id", skillsController.deleteSkills);

module.exports = router;
