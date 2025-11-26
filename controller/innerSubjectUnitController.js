const Subject = require("../models/subject-modal");
const InnerSubjectUnit = require("../models/inner-subjectUnit-modal");

const mongoose = require("mongoose"); // Ensure mongoose is imported

const createInnerSubjectUnit = async (req, res) => {
  try {
    const { subjectId, title, content, url, createdOn, updatedOn, active } =
      req.body;

    // Validate required fields
    if (!subjectId || !title || !content || !url || !createdOn || !updatedOn) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that subjectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid subjectId format" });
    }

    // Create a new InnerSubjectUnit
    const newInnerSubjectUnit = new InnerSubjectUnit({
      title,
      content,
      url,
      createdOn,
      updatedOn,
      active,
    });

    await newInnerSubjectUnit.save();

    // Find the subject by ObjectId
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found", subjectId });
    }

    // Add the new inner subject unit to the subject's innerSubjects array
    subject.innerSubjects.push(newInnerSubjectUnit._id);

    await subject.save();

    res.status(201).json({
      message: "Inner subject unit created and added to the subject",
      innerSubjectUnit: newInnerSubjectUnit,
      subject,
    });
  } catch (error) {
    console.error("Error creating inner subject unit:", error);
    res.status(500).json({
      message: "Failed to create inner subject unit",
      error: error.message,
    });
  }
};

const getInnerSubjectUnitsBySubject = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await Subject.findById(subjectId).populate("innerSubjects");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject.innerSubjects);
  } catch (error) {
    console.error("Error fetching inner subject units:", error);
    res.status(500).json({
      message: "Failed to fetch inner subject units",
      error: error.message,
    });
  }
};

const updateInnerSubjectUnit = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, updatedOn, active } = req.body;

  try {
    const updatedUnits = await InnerSubjectUnit.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        updatedOn,
        active,
      },
      { new: true } // Return the updated stream
    );

    if (!updatedUnits) {
      return res.status(404).json({ message: "Units not found" });
    }

    res.status(200).json(updatedUnits); // Return the updated stream
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating Units", error: error.message });
  }
};
const deleteInnerSubjectUnit = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStream = await InnerSubjectUnit.findByIdAndDelete(id);
    if (!deletedStream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res
      .status(200)
      .json({ message: "Inner Subject deleted successfully", deletedStream });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Subject", error: error.message });
  }
};

module.exports = {
  createInnerSubjectUnit,
  getInnerSubjectUnitsBySubject,
  updateInnerSubjectUnit,
  deleteInnerSubjectUnit,
};
