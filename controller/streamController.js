const Stream = require("../models/stream-modal"); // Adjust path if needed

// Create a new stream
const createStream = async (req, res) => {
  const { title, url, content, createdOn, updatedOn, active } = req.body;

  try {
    const newStream = new Stream({
      title,
      url,
      content,
      createdBy: "super admin", // Automatically assigned on creation
      createdOn,
      updatedBy: "super admin", // Automatically assigned on creation
      updatedOn,
      active,
    });

    const savedStream = await newStream.save();
    res.status(201).json(savedStream); // Return the created stream
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating stream", error: error.message });
  }
};

// Get all streams
const getStreams = async (req, res) => {
  try {
    const streams = await Stream.find();
    res.status(200).json(streams);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching streams", error: error.message });
  }
};

// Get a stream by ID
const getStreamById = async (req, res) => {
  const { id } = req.params;

  try {
    const stream = await Stream.findById(id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res.status(200).json(stream);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching stream", error: error.message });
  }
};

// Update a stream by ID
const updateStream = async (req, res) => {
  const { id } = req.params;
  const { title, url, content, updatedBy, updatedOn, active } = req.body;

  try {
    const updatedStream = await Stream.findByIdAndUpdate(
      id,
      {
        title,
        url,
        content,
        updatedBy: updatedBy || "super admin", // Default to "super admin" if not provided
        updatedOn,
        active,
      },
      { new: true } // Return the updated stream
    );

    if (!updatedStream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.status(200).json(updatedStream); // Return the updated stream
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating stream", error: error.message });
  }
};
// Delete a stream by ID
const deleteStream = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStream = await Stream.findByIdAndDelete(id);
    if (!deletedStream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res
      .status(200)
      .json({ message: "Stream deleted successfully", deletedStream });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting stream", error: error.message });
  }
};

module.exports = {
  createStream,
  getStreams,
  getStreamById,
  updateStream,
  deleteStream,
};
