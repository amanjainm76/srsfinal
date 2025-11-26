const express = require("express");
const router = express.Router();
const innerSubjectUnitController = require("../controller/innerSubjectUnitController");

// Route to create an inner subject unit
router.post(
  "/innerSubjectUnits",
  innerSubjectUnitController.createInnerSubjectUnit
);

// Route to get all inner subject units for a specific subject
router.get(
  "/innerSubjectUnits/:subjectId", // Corrected to accept subjectId as a URL parameter
  innerSubjectUnitController.getInnerSubjectUnitsBySubject
);

// Route to update an inner subject unit by ID
router.put(
  "/innerSubjectUnits/:id",
  innerSubjectUnitController.updateInnerSubjectUnit
);

// Route to delete an inner subject unit by ID
router.delete(
  "/innerSubjectUnits/:id",
  innerSubjectUnitController.deleteInnerSubjectUnit
);

module.exports = router;
