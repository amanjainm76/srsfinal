const Test = require("../models/test-modal");

// Create Test
const createTest = async (req, res) => {
  const { title, url, description, testScope, createdOn, updatedOn, active } =
    req.body;

  try {
    // Clean content if necessary
    let cleanContent = description
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    // Create a new Test document
    const newTest = new Test({
      title,
      url,
      description: cleanContent,
      testScope,
      createdBy: "superadmin",
      createdOn,
      updatedBy: "superadmin",
      updatedOn,
      active,
    });

    // Save the new test to the database
    const savedTest = await newTest.save();

    // Respond with the created test object
    res.status(201).json(savedTest);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating test.");
  }
};

// Get all Tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.status(200).json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching tests.");
  }
};

// Get a single Test by ID
const getTestById = async (req, res) => {
  const { id } = req.params;

  try {
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).send("Test not found.");
    }
    res.status(200).json(test);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching test.");
  }
};

// Update a Test by ID
const updateTest = async (req, res) => {
  const { id } = req.params;
  const { title, url, description, testScope, updatedBy, updatedOn, active } =
    req.body;

  try {
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      {
        title,
        url,
        description,
        testScope,
        updatedBy: updatedBy || "super admin",
        updatedOn,
        active,
      },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(updatedTest);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating Test", error: error.message });
  }
};

// Delete a Test by ID
const deleteTest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTest = await Test.findByIdAndDelete(id);
    if (!deletedTest) {
      return res.status(404).send("Test not found.");
    }

    res.status(200).send("Test deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting test.");
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
};
