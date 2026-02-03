const express = require("express");
const router = express.Router();
const centerController = require("../controller/center-controller");

// POST: Add new center
router.route("/register").post(centerController.registerCenter);

// GET: Get all centers
router.route("/all").get(centerController.getAllCenters);

// PUT: Update center by ID
router.route("/update/:id").put(centerController.updateCenter);

// DELETE: Delete center by ID
router.route("/delete/:id").delete(centerController.deleteCenter);

module.exports = router;
