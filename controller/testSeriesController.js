const TestSeries = require("../models/testSeries-modal"); // Adjust path if needed
// Create a new test series
const createTestSeries = async (req, res) => {
  const {
    title,
    url,
    content,
    startDate,
    endDate,
    stream,
    maximumTest,
    tags,
    createdOn,
    updatedOn,
    active,
  } = req.body;

  try {
    const newTestSeries = new TestSeries({
      title,
      url,
      content,
      startDate, // Store date in MongoDB as ISO string
      endDate, // Store date in MongoDB as ISO string
      stream,
      maximumTest,
      tags,
      createdBy: "super admin",
      createdOn,
      updatedBy: "super admin",
      updatedOn,
      active: active !== undefined ? active : true,
    });

    const savedTestSeries = await newTestSeries.save();
    res.status(201).json(savedTestSeries);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating test series", error: error.message });
  }
};

// Get all test series
const getTestSeries = async (req, res) => {
  try {
    const testSeries = await TestSeries.find();
    res.status(200).json(testSeries); // Return all test series
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching test series", error: error.message });
  }
};

// Get a specific test series by ID
const getTestSeriesById = async (req, res) => {
  const { id } = req.params;

  try {
    const testSeries = await TestSeries.findById(id);
    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }
    res.status(200).json(testSeries); // Return the test series by ID
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching test series", error: error.message });
  }
};

// Update a test series by ID
const updateTestSeries = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    url,
    content,
    startDate,
    endDate,
    stream,
    maximumTest,
    tags,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  try {
    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        startDate,
        endDate,
        stream,
        maximumTest,
        tags,
        updatedBy: updatedBy || "super admin", // Default to "super admin" if not provided
        updatedOn,
        active,
      },
      { new: true, runValidators: true } // Return the updated test series
    );

    if (!updatedTestSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    res.status(200).json(updatedTestSeries); // Return the updated test series
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating test series", error: error.message });
  }
};

// Delete a test series by ID
const deleteTestSeries = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTestSeries = await TestSeries.findByIdAndDelete(id);
    if (!deletedTestSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }
    res
      .status(200)
      .json({ message: "Test series deleted successfully", deletedTestSeries });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting test series", error: error.message });
  }
};

// Get test series by active status
const getTestSeriesByActiveStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const activeStatus = status === "true" ? true : false;
    const testSeries = await TestSeries.find({ active: activeStatus });
    res.status(200).json(testSeries);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching test series by active status",
      error: error.message,
    });
  }
};

// Search test series by tags
const getTestSeriesByTag = async (req, res) => {
  const { tag } = req.params;

  try {
    const testSeries = await TestSeries.find({ tags: { $in: [tag] } });
    res.status(200).json(testSeries);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching test series by tag",
      error: error.message,
    });
  }
};

// Update only the active status of a test series (toggle active/inactive)
const updateActiveStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const testSeries = await TestSeries.findById(id);
    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    // Toggle the active status
    testSeries.active = !testSeries.active;
    await testSeries.save();

    res.status(200).json({
      message: `Test series ${
        testSeries.active ? "activated" : "deactivated"
      } successfully`,
      data: testSeries,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error toggling active status", error: error.message });
  }
};

module.exports = {
  createTestSeries,
  getTestSeries,
  getTestSeriesById,
  updateTestSeries,
  deleteTestSeries,
  getTestSeriesByActiveStatus,
  getTestSeriesByTag,
  updateActiveStatus,
};
