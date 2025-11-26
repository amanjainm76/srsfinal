const MarkingSchemes = require("../models/marking-scheme-modal");

const createMarkingScheme = async (req, res) => {
  try {
    const {
      title,
      content,
      isPartialMarking,
      createdBy = "superadmin",
      updatedBy = "superadmin",
      createdOn,
      updatedOn,
      active,
      questions, // Array of questions to process
    } = req.body;

    // Ensure that questions array is provided
    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one question is required." });
    }

    // Iterate over each question to validate its fields
    const invalidQuestion = questions.find((question, index) => {
      // Validate required fields for each question
      if (!question.questionType || !question.marks) {
        console.log(
          `Invalid question at index ${index}: Missing questionType or marks`
        );
        return true; // Invalid question found
      }

      const { marks, partialMarks, questionType } = question;

      // Handle cases where both marks and partialMarks should be present (for certain question types)
      const requiresPartialMarks = [
        "Multiple Correct",
        "Comprehension MCQ",
        "Matrix 4*5",
        "Matrix 4*6",
        "Matrix 3*4",
      ];

      // For these question types, check that both marks and partialMarks are present
      if (requiresPartialMarks.includes(questionType)) {
        if (!partialMarks) {
          console.log(
            `Invalid question at index ${index}: Missing partialMarks`
          );
          return true; // Invalid question found
        }

        // Validate marks structure (rightMarks, wrongMarks, notAttemptedMarks)
        if (
          typeof marks.rightMarks !== "number" ||
          typeof marks.wrongMarks !== "number" ||
          typeof marks.notAttemptedMarks !== "number"
        ) {
          console.log(`Invalid marks structure at index ${index}:`, marks);
          return true; // Invalid marks structure found
        }

        // Validate partialMarks structure (singleRightMarks, singleWrongMarks, singleNotAttemptedMarks)
        if (
          typeof partialMarks.singleRightMarks !== "number" ||
          typeof partialMarks.singleWrongMarks !== "number" ||
          typeof partialMarks.singleNotAttemptedMarks !== "number"
        ) {
          console.log(
            `Invalid partialMarks structure at index ${index}:`,
            partialMarks
          );
          return true; // Invalid partialMarks structure found
        }
      } else {
        // For other question types, ensure only marks are provided (partialMarks should be optional)
        if (
          typeof marks.rightMarks !== "number" ||
          typeof marks.wrongMarks !== "number" ||
          typeof marks.notAttemptedMarks !== "number"
        ) {
          console.log(`Invalid marks structure at index ${index}:`, marks);
          return true; // Invalid marks structure found
        }
      }

      return false; // Valid question
    });

    if (invalidQuestion) {
      return res
        .status(400)
        .json({ message: "Invalid question data in the request." });
    }

    // Create the new marking scheme object
    const newMarkingScheme = new MarkingSchemes({
      title,
      content,
      isPartialMarking,
      createdBy,
      updatedBy,
      createdOn,
      updatedOn,
      active,
      questions, // Store the whole array of questions as part of the scheme
    });

    // Save the new marking scheme
    const savedMarkingScheme = await newMarkingScheme.save();
    res.status(201).json(savedMarkingScheme);
  } catch (error) {
    console.error("Error creating marking scheme:", error);
    res
      .status(500)
      .json({ message: "Error creating marking scheme", error: error.message });
  }
};

// Get all marking schemes
const getMarkingSchemes = async (req, res) => {
  try {
    const schemes = await MarkingSchemes.find();
    res.status(200).json(schemes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marking schemes" });
  }
};

// Get a single marking scheme by ID
const getMarkingSchemeById = async (req, res) => {
  const { id } = req.params;
  try {
    const scheme = await MarkingSchemes.findById(id);
    if (!scheme) {
      return res.status(404).json({ message: "Marking scheme not found" });
    }
    res.status(200).json(scheme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marking scheme" });
  }
};

// Update a marking scheme
const updateMarkingScheme = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    content,
    isPartialMarking,
    active,
    questions, // Array of updated questions
  } = req.body;

  try {
    // First, find the existing marking scheme
    const existingScheme = await MarkingSchemes.findById(id);

    if (!existingScheme) {
      return res.status(404).json({ message: "Marking scheme not found" });
    }

    // Validate questions array if it's being updated
    if (Array.isArray(questions) && questions.length > 0) {
      // Validate each question (basic structure check)
      const invalidQuestion = questions.find((question, index) => {
        if (!question.questionType || !question.marks) {
          console.log(
            `Invalid question at index ${index}: Missing questionType or marks`
          );
          return true; // Invalid question found
        }

        const { marks, partialMarks, questionType } = question;

        // Handle cases where both marks and partialMarks should be present (for certain question types)
        const requiresPartialMarks = [
          "Multiple Correct",
          "Comprehension MCQ",
          "Matrix 4*5",
          "Matrix 4*6",
          "Matrix 3*4",
        ];

        // For these question types, check that both marks and partialMarks are present
        if (requiresPartialMarks.includes(questionType)) {
          if (!partialMarks) {
            console.log(
              `Invalid question at index ${index}: Missing partialMarks`
            );
            return true; // Invalid question found
          }

          // Validate marks structure (rightMarks, wrongMarks, notAttemptedMarks)
          if (
            typeof marks.rightMarks !== "number" ||
            typeof marks.wrongMarks !== "number" ||
            typeof marks.notAttemptedMarks !== "number"
          ) {
            console.log(`Invalid marks structure at index ${index}:`, marks);
            return true; // Invalid marks structure found
          }

          // Validate partialMarks structure (singleRightMarks, singleWrongMarks, singleNotAttemptedMarks)
          if (
            typeof partialMarks.singleRightMarks !== "number" ||
            typeof partialMarks.singleWrongMarks !== "number" ||
            typeof partialMarks.singleNotAttemptedMarks !== "number"
          ) {
            console.log(
              `Invalid partialMarks structure at index ${index}:`,
              partialMarks
            );
            return true; // Invalid partialMarks structure found
          }
        } else {
          // For other question types, ensure only marks are provided (partialMarks should be optional)
          if (
            typeof marks.rightMarks !== "number" ||
            typeof marks.wrongMarks !== "number" ||
            typeof marks.notAttemptedMarks !== "number"
          ) {
            console.log(`Invalid marks structure at index ${index}:`, marks);
            return true; // Invalid marks structure found
          }
        }

        return false; // Valid question
      });

      if (invalidQuestion) {
        return res
          .status(400)
          .json({ message: "Invalid question data in the request." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "At least one question is required." });
    }

    // Update the marking scheme data
    existingScheme.title = title || existingScheme.title;
    existingScheme.content = content || existingScheme.content;
    existingScheme.isPartialMarking =
      isPartialMarking !== undefined
        ? isPartialMarking
        : existingScheme.isPartialMarking;
    existingScheme.active =
      active !== undefined ? active : existingScheme.active;
    existingScheme.questions = questions || existingScheme.questions; // Only update questions if provided

    existingScheme.updatedBy = req.user ? req.user.username : "superadmin";
    existingScheme.updatedOn = new Date().toISOString();

    // Save the updated marking scheme
    const updatedScheme = await existingScheme.save();

    res.status(200).json(updatedScheme); // Send back the updated marking scheme
  } catch (error) {
    console.error("Error updating marking scheme:", error);
    res
      .status(500)
      .json({ message: "Error updating marking scheme", error: error.message });
  }
};

// Delete a marking scheme
const deleteMarkingScheme = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedScheme = await MarkingSchemes.findByIdAndDelete(id);
    if (!deletedScheme) {
      return res.status(404).json({ message: "Marking scheme not found" });
    }
    res.status(200).json({ message: "Marking scheme deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting marking scheme" });
  }
};

module.exports = {
  createMarkingScheme,
  getMarkingSchemes,
  getMarkingSchemeById,
  updateMarkingScheme,
  deleteMarkingScheme,
};
