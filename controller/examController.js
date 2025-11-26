// examController.js
const Exams = require("../models/exam-modal"); // Import the Exams model

// Create a new exam
const createExam = async (req, res) => {
  const {
    title,
    uniqueURL,
    description,
    markingScheme,
    guildeline,
    stream,

    createdBy,
    createdOn,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  try {
    // Create a new exam document
    const newExam = new Exams({
      title,
      uniqueURL,
      description,
      markingScheme,
      guildeline,
      stream,

      createdBy: "superadmin",
      createdOn,
      updatedBy: "superadmin",
      updatedOn,
      active,
    });

    // Save the exam to the database
    await newExam.save();

    res
      .status(201)
      .json({ message: "Exam created successfully", exam: newExam });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating exam", error: error.message });
  }
};

// Get all exams
const getAllExams = async (req, res) => {
  try {
    const exams = await Exams.find(); // Find all exams
    res.status(200).json(exams); // Return the list of exams
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching exams", error: error.message });
  }
};

// Get a single exam by its ID
const getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const exam = await Exams.findById(id); // Find the exam by ID
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json(exam); // Return the exam
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching exam", error: error.message });
  }
};

// Update an exam by its ID
const updateExamById = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    uniqueURL,
    markingScheme,
    guildeline,
    stream,
    description,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  try {
    const updatedExam = await Exams.findByIdAndUpdate(
      id,
      {
        title,
        uniqueURL,
        markingScheme,
        guildeline,
        stream,
        description,
        updatedBy,
        updatedOn,
        active,
      },
      { new: true } // Return the updated document
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res
      .status(200)
      .json({ message: "Exam updated successfully", exam: updatedExam });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating exam", error: error.message });
  }
};

// Delete an exam by its ID
const deleteExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExam = await Exams.findByIdAndDelete(id); // Delete the exam by ID

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res
      .status(200)
      .json({ message: "Exam deleted successfully", exam: deletedExam });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting exam", error: error.message });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExamById,
  deleteExamById,
};
