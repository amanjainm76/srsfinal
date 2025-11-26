const Subject = require("../models/subject-modal");

// Create a new subject
const createSubject = async (req, res) => {
  console.log(req.body); // Log the incoming data to check if "stream" is an array

  const { title, url, content, stream, createdOn, updatedOn, active } =
    req.body;

  try {
    const newSubject = new Subject({
      title,
      url,
      content,
      stream, // This should now be an array
      createdBy: "superadmin",
      createdOn,
      updatedBy: "superadmin",
      updatedOn,
      active,
    });

    const savedSubject = await newSubject.save();
    res.status(201).json(savedSubject); // Return the created subject
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating subject", error: error.message });
  }
};

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching subjects", error: error.message });
  }
};

// Get a single subject by ID
const getSubjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching subject", error: error.message });
  }
};

// Update a subject by ID
const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, stream, active } = req.body;
  const updatedOn = new Date().toISOString(); // Current date and time in ISO format

  // Validate stream field when it's an array
  if (
    (stream && !Array.isArray(stream)) ||
    stream.some(
      s => !["Commerce", "Medical", "Foundation", "Engineering"].includes(s)
    )
  ) {
    return res.status(400).json({ message: "Invalid stream(s) provided." });
  }

  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        stream,
        active,
        updatedOn,
      },
      { new: true } // Return the updated document
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating subject", error: error.message });
  }
};

// Delete a subject by ID
const deleteSubject = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting subject", error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
