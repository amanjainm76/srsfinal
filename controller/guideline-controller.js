const Guideline = require("../models/guideline-modal"); // Assuming guideline model is in the 'models' directory

//*-- Create a new guideline --
const createGuideline = async (req, res) => {
  const { title, content, createdBy, createdOn, updatedBy, updatedOn, active } =
    req.body;

  try {
    // Clean the content: remove HTML tags and entities like &nbsp;
    let cleanContent = content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with & (if necessary)
      .replace(/&lt;/g, "<") // Replace &lt; with < (if necessary)
      .replace(/&gt;/g, ">"); // Replace &gt; with > (if necessary)

    // Create a new guideline document
    const newGuideline = new Guideline({
      title,
      content: cleanContent, // Store cleaned content
      createdBy,
      createdOn,
      updatedBy,
      updatedOn,
      active,
    });

    const savedGuideline = await newGuideline.save();
    res.status(201).json(savedGuideline);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating guideline.");
  }
};

// Get all guidelines
const getAllGuidelines = async (req, res) => {
  try {
    // Fetch all guidelines from the database
    const guidelines = await Guideline.find();
    res.json(guidelines);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching guidelines.");
  }
};

// Get a single guideline by ID
const getGuidelineById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the guideline by ID
    const guideline = await Guideline.findById(id);

    if (!guideline) {
      return res.status(404).send("Guideline not found.");
    }

    res.json(guideline);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching guideline.");
  }
};

// Update a guideline by ID
const updateGuidelineById = async (req, res) => {
  const { id } = req.params;
  const { title, content, active, updatedBy, updatedOn } = req.body;

  try {
    // Find the guideline by ID and update it
    const updatedGuideline = await Guideline.findByIdAndUpdate(
      id,
      {
        title,
        content,
        active, // Update active status
        updatedBy,
        updatedOn,
      },
      { new: true } // Return the updated document
    );

    if (!updatedGuideline) {
      return res.status(404).send("Guideline not found.");
    }

    res.json(updatedGuideline);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating guideline.");
  }
};

// Delete a guideline by ID
const deleteGuidelineById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the guideline by ID and remove it from the database
    const deletedGuideline = await Guideline.findByIdAndDelete(id);

    if (!deletedGuideline) {
      return res.status(404).send("Guideline not found.");
    }

    res.status(200).send("Guideline deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting guideline.");
  }
};

// Toggle active status of a guideline
const toggleActiveStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const guideline = await Guideline.findById(id);

    if (!guideline) {
      return res.status(404).send("Guideline not found.");
    }

    guideline.active = !guideline.active; // Toggle the active status

    // Save the updated guideline
    await guideline.save();

    res.json(guideline);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error toggling active status.");
  }
};

module.exports = {
  createGuideline,
  getAllGuidelines,
  getGuidelineById,
  updateGuidelineById,
  deleteGuidelineById,
  toggleActiveStatus,
};
