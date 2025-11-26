const express = require("express");
const router = express.Router();

const {
  createTestList,
  getTestLists,
  getTestListById,
  updateTestList,
  deleteTestList,
  filterTestListsByTestType,
  filterTestListsByTestTypeAndContent,
} = require("../controller/testListController"); // Adjust the path to the controller
// Route to create a new TestList
router.post("/testlists", createTestList);

// Define the route for filtering test lists by testType and content
router.get("/testlists/filter", filterTestListsByTestTypeAndContent);

router.get("/testlists/filter", filterTestListsByTestType);
// Route to get all TestLists
router.get("/testlists", getTestLists);

// Route to get a single TestList by ID
router.get("/testlists/:id", getTestListById);

// Route to update a TestList by ID
router.put("/testlists/:id", updateTestList);

// Route to delete a TestList by ID
router.delete("/testlists/:id", deleteTestList);

module.exports = router;
