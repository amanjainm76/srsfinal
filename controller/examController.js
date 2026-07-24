// examController.js
const Exams = require("../models/exam-modal"); // Import the Exams mode
const Guideline = require("../models/guideline-modal");
const MarkingSceheme = require("../models/marking-scheme-modal");

// Create a new exam
const createExam = async (req, res) => {
  const {
    title,
    uniqueURL,
    description,
    markingScheme,
    guildeline,
    createdBy,
    createdOn,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  try {

    const markingSchemeData = await MarkingSceheme.findById(markingScheme);

    const markingSchemeObj ={
      id:markingSchemeData._id,
      name:markingSchemeData.title
    }

    const guidelineData = await Guideline.findById(guildeline);

    const guidelineObj ={
      id:guidelineData._id,
      name:guidelineData.title
    }    

    // Create a new exam document
    const newExam = new Exams({
      title,
      uniqueURL,
      description,
      markingScheme:markingSchemeObj,
      guildeline:guidelineObj,
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
    description,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  console.log("BACKEND REQ BODY  - ",req.body);

  try {

    const markingSchemeData = await MarkingSceheme.findById(markingScheme);

    const markingSchemeObj ={
      id:markingSchemeData._id,
      name:markingSchemeData.title
    }

    const guidelineData = await Guideline.findById(guildeline);

    const guidelineObj ={
      id:guidelineData._id,
      name:guidelineData.title
    }  

    const updatedExam = await Exams.findByIdAndUpdate(
      id,
      {
        title,
        uniqueURL,
        markingScheme:markingSchemeObj,
        guildeline:guidelineObj,
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

    res.status(200).json({ message: "Exam deleted successfully", exam: deletedExam });
  } 
  
  catch (error) 
  {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting exam", error: error.message });
  }
};


const fetchGuidelines = async (req,res) =>{
  try
  {
    const GuidelinesData = await Guideline.find(); 
    res.status(200).json(GuidelinesData);
  }
  catch(e)
  {
    console.error(e);
    res.status(500).json({ message: "Error deleting exam", error: e.message });
  }
}

const fetchMarkingScheme = async (req,res) =>{
  try
  {
    const MarkingSchemeData = await MarkingSceheme.find();
    res.status(200).json(MarkingSchemeData);
  }
  catch(e)
  {
    console.error(e);
    res.status(500).json({ message: "Error deleting exam", error: e.message });
  }
}


module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExamById,
  deleteExamById,
  fetchGuidelines,
  fetchMarkingScheme,
};
