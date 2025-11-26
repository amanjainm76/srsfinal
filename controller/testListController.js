const mongoose = require("mongoose");
const TestList = require("../models/testList-modal"); // Adjust path based on project structure
const TestSeries = require("../models/testSeries-modal"); // Adjust path if needed
// Create a new TestList
const createTestList = async (req, res) => {
  const {
    title,
    url,
    content,
    examType,
    testType,
    distribution,
    maxQuestions,
    duration,
    guideline,
    markingScheme,
    startDate,
    endDate,
    solutionUnlockDate,
    tags,
    isActiveHasSection,
    sections,
    createdOn,
    updatedOn,
    active,
    select,
  } = req.body;

  // Validate required fields
  if (
    !title ||
    !url ||
    !examType ||
    !testType ||
    !maxQuestions ||
    !duration ||
    !guideline ||
    !markingScheme ||
    !startDate ||
    !endDate ||
    !tags ||
    !solutionUnlockDate
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newTestList = new TestList({
      title,
      url,
      content,
      examType,
      testType,
      distribution,
      maxQuestions,
      duration,
      guideline,
      markingScheme,
      startDate,
      endDate,
      solutionUnlockDate,
      tags,
      isActiveHasSection,
      sections,
      createdOn,
      updatedOn,
      active: active || false,
      select,
    });

    const savedTestList = await newTestList.save();
    res.status(201).json(savedTestList); // Return the created TestList
  } catch (error) {
    console.error("Error creating TestList:", error);
    res.status(500).json({
      message: "Error creating TestList",
      error: error.message,
    });
  }
};

// Get all TestLists
const getTestLists = async (req, res) => {
  try {
    const testLists = await TestList.find();
    res.status(200).json(testLists); // Return all TestLists
  } catch (error) {
    console.error("Error fetching TestLists:", error);
    res.status(500).json({
      message: "Error fetching TestLists",
      error: error.message,
    });
  }
};

// Get a single TestList by ID
const getTestListById = async (req, res) => {
  const { id } = req.params;

  try {
    const testList = await TestList.findById(id);
    if (!testList) {
      return res.status(404).json({ message: "TestList not found" });
    }
    res.status(200).json(testList); // Return the found TestList
  } catch (error) {
    console.error("Error fetching TestList:", error);
    res.status(500).json({
      message: "Error fetching TestList",
      error: error.message,
    });
  }
};

// Update a TestList by ID
const updateTestList = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    url,
    content,
    examType,
    testType,
    distribution,
    maxQuestions,
    duration,
    guideline,
    markingScheme,
    startDate,
    endDate,
    solutionUnlockDate,
    tag,
    isActiveHasSection,
    sections,
    updatedOn,
    active,
    select,
  } = req.body;

  try {
    const updatedTestList = await TestList.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        examType,
        testType,
        distribution,
        maxQuestions,
        duration,
        guideline,
        markingScheme,
        startDate,
        endDate,
        solutionUnlockDate,
        tag,
        isActiveHasSection,
        sections,
        updatedOn,
        select,
        active: active || false, // Ensure that active is a boolean (default to false)
      },
      { new: true } // Return the updated TestList
    );

    if (!updatedTestList) {
      return res.status(404).json({ message: "TestList not found" });
    }
    res.status(200).json(updatedTestList); // Return the updated TestList
  } catch (error) {
    console.error("Error updating TestList:", error);
    res.status(500).json({
      message: "Error updating TestList",
      error: error.message,
    });
  }
};

// Delete a TestList by ID
const deleteTestList = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTestList = await TestList.findByIdAndDelete(id);
    if (!deletedTestList) {
      return res.status(404).json({ message: "TestList not found" });
    }
    res.status(200).json({
      message: "TestList deleted successfully",
      deletedTestList,
    });
  } catch (error) {
    console.error("Error deleting TestList:", error);
    res.status(500).json({
      message: "Error deleting TestList",
      error: error.message,
    });
  }
};

const filterTestListsByTestType = async (req, res) => {
  const { testType } = req.query; // Get the 'testType' from query parameters

  try {
    // Check if 'testType' parameter is provided in the query
    if (!testType) {
      return res
        .status(400)
        .json({ message: "testType parameter is required" });
    }

    // Ensure the 'testType' is treated as a string
    const testTypeString = String(testType);

    // Use regular expression to match the nested testType field
    const filteredTestLists = await TestList.find({
      // Search inside each object of the testType array
      "testType.testType": { $regex: new RegExp(testTypeString, "i") }, // Case-insensitive search
    });

    if (filteredTestLists.length === 0) {
      return res
        .status(404)
        .json({ message: "No test lists found for this test type" });
    }

    return res.status(200).json(filteredTestLists);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test lists",
      error: error.message,
    });
  }
};

const filterTestListsByTestTypeAndContent = async (req, res) => {
  const { testType, content } = req.query;

  try {
    const decodedTestType = testType ? decodeURIComponent(testType) : null;
    const decodedContent = content ? decodeURIComponent(content).trim() : null;

    console.log("Decoded Parameters:", { decodedTestType, decodedContent });

    if (!decodedTestType && !decodedContent) {
      return res.status(400).json({
        message:
          "At least one of 'testType' or 'content' parameter is required",
      });
    }

    let filter = {};

    // Add testType filter
    if (decodedTestType) {
      filter["testType.testType"] = {
        $regex: new RegExp(decodedTestType, "i"),
      }; // Case-insensitive search
    }

    // Add content filter
    if (decodedContent) {
      filter["content"] = { $regex: new RegExp(decodedContent, "i") }; // Case-insensitive search
    }

    console.log("Filter:", filter); // Log the final filter object

    // Fetch the filtered test lists
    const filteredTestLists = await TestList.find(filter);

    if (filteredTestLists.length === 0) {
      return res.status(404).json({
        message: "No test lists found matching the provided criteria",
      });
    }

    return res.status(200).json(filteredTestLists);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test lists",
      error: error.message,
    });
  }
};

module.exports = {
  filterTestListsByTestTypeAndContent,
  filterTestListsByTestType,
  createTestList,
  getTestLists,
  getTestListById,
  updateTestList,
  deleteTestList,
};
