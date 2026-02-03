const Center = require("../models/center-model");

// 1. Create New Center
const registerCenter = async (req, res) => {
  try {
    const { centerName, mobileNumber, state, city, address } = req.body;

    // Check if center with same name/mobile already exists (Optional)
    const existingCenter = await Center.findOne({ mobileNumber });
    if (existingCenter) {
      return res.status(400).json({
        success: false,
        message: "Center with this mobile number already exists.",
      });
    }

    const newCenter = await Center.create({
      centerName,
      mobileNumber,
      state,
      city,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Center registered successfully",
      center: newCenter,
    });
  } catch (error) {
    console.error("Error creating center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 2. Get All Centers
const getAllCenters = async (req, res) => {
  try {
    const centers = await Center.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json({
      success: true,
      centers,
    });
  } catch (error) {
    console.error("Error fetching centers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 3. Update Center
const updateCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCenter = await Center.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true,
    });

    if (!updatedCenter) {
      return res
        .status(404)
        .json({ success: false, message: "Center not found" });
    }

    res.status(200).json({
      success: true,
      message: "Center updated successfully",
      center: updatedCenter,
    });
  } catch (error) {
    console.error("Error updating center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 4. Delete Center
const deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCenter = await Center.findByIdAndDelete(id);

    if (!deletedCenter) {
      return res
        .status(404)
        .json({ success: false, message: "Center not found" });
    }

    res.status(200).json({
      success: true,
      message: "Center deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting center:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  registerCenter,
  getAllCenters,
  updateCenter,
  deleteCenter,
};
