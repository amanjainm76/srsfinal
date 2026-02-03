const Batch = require("../models/batch-model");

// 1. Create Batch
const registerBatch = async (req, res) => {
  try {
    const { batchName, center, stream, active } = req.body;

    const newBatch = await Batch.create({
      batchName,
      center,
      stream,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch: newBatch,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Get All Batches (with Populate)
const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("center", "centerName")
      .populate("stream", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Update Batch
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBatch = await Batch.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedBatch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. Delete Batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    await Batch.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { registerBatch, getAllBatches, updateBatch, deleteBatch };
