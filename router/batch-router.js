const express = require("express");
const router = express.Router();
const batchController = require("../controller/batch-controller");

router.post("/register", batchController.registerBatch);
router.get("/all", batchController.getAllBatches);
router.put("/update/:id", batchController.updateBatch);
router.delete("/delete/:id", batchController.deleteBatch);

module.exports = router;
