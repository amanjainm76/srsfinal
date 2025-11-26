const Tag = require("../models/tag-modal"); // Adjust path if needed

// Create a new tag
const createTag = async (req, res) => {
  const { title, url, content, createdOn, updatedOn, active } = req.body;

  try {
    const newTag = new Tag({
      title,
      url,
      content,
      createdBy: "super admin", // Automatically assigned on creation
      createdOn,
      updatedBy: "super admin", // Automatically assigned on creation
      updatedOn,
      active,
    });

    const savedTag = await newTag.save();
    res.status(201).json(savedTag); // Return the created tag
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating Tag", error: error.message });
  }
};

// Get all tags
const getTag = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching Tags", error: error.message });
  }
};

// Get a tag by ID
const getTagById = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json(tag);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching Tag", error: error.message });
  }
};

// Update a tag by ID
const updateTag = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, updatedBy, updatedOn, active } = req.body;

  try {
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        updatedBy: updatedBy || "super admin", // Default to "super admin" if not provided
        updatedOn,
        active,
      },
      { new: true } // Return the updated tag
    );

    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(updatedTag); // Return the updated tag
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating Tag", error: error.message });
  }
};

// Delete a tag by ID
const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTag = await Tag.findByIdAndDelete(id); // Fixed to 'Tag' instead of 'Stream'
    if (!deletedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ message: "Tag deleted successfully", deletedTag }); // Corrected reference
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Tag", error: error.message });
  }
};

module.exports = {
  createTag,
  getTag,
  getTagById,
  updateTag,
  deleteTag,
};
