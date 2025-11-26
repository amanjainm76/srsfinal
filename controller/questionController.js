const Question = require("../models/questions-modal"); // Import the Question model
const sanitizeHtml = require("sanitize-html");
// Create a new Question
const createQuestion = async (req, res) => {
  try {
    const {
      SRSUniqueCode,
      subjectType,
      enterQuestion,
      questions,
      url,
      hitsSolution,
      stream,
      subTopic,
      skills,
      tags,
      level,
      createdBy = "super admin",
      createdOn,
      updatedBy = "super admin",
      updatedOn,
      active,
    } = req.body;

    // Ensure enterQuestion and questions are strings before sanitizing
    const cleanedEnterQuestion =
      typeof enterQuestion === "string"
        ? sanitizeHtml(enterQuestion, {
            allowedTags: [], // Don't allow any HTML tags
          })
        : ""; // Default to an empty string if undefined or array

    // If subjectType is an array, convert it to a string (comma-separated)
    const cleanedSubjectType = Array.isArray(subjectType)
      ? subjectType.join(", ")
      : subjectType;

    // Sanitize questions (if necessary), assuming it's an array of question objects
    const cleanedQuestions =
      questions && Array.isArray(questions)
        ? questions.map(q => {
            return {
              ...q,
              trueFalseAnswer:
                q.trueFalseAnswer === "true"
                  ? true
                  : q.trueFalseAnswer === "false"
                  ? false
                  : null, // Convert to boolean
              questionContent:
                typeof q.questionContent === "string"
                  ? sanitizeHtml(q.questionContent, { allowedTags: [] })
                  : "", // Remove HTML tags
              options: q.options.map(option => {
                // Sanitize each option to strip out HTML tags
                return typeof option === "string"
                  ? sanitizeHtml(option, { allowedTags: [] })
                  : option;
              }),

              subjectiveAnswerFormat:
                typeof q.subjectiveAnswerFormat === "string"
                  ? sanitizeHtml(q.subjectiveAnswerFormat, { allowedTags: [] })
                  : "", // Sanitize subjectiveAnswerFormat
            };
          })
        : [];

    // Ensure hitsSolution is an array of strings
    const cleanedHitsSolution =
      typeof hitsSolution === "string"
        ? sanitizeHtml(hitsSolution, { allowedTags: [] })
        : ""; // Default to empty string if not a valid string

    // If stream, subTopic, and other fields are arrays, convert them to comma-separated strings
    const cleanedStream = Array.isArray(stream) ? stream.join(", ") : stream;
    const cleanedSubTopic = Array.isArray(subTopic)
      ? subTopic.join(", ")
      : subTopic;
    const cleanedSkills = Array.isArray(skills) ? skills.join(", ") : skills;
    const cleanedTags = Array.isArray(tags) ? tags.join(", ") : tags;
    const cleanedLevel = Array.isArray(level) ? level.join(", ") : level;

    // Generate a random 6-digit number for SRSUniqueCode if not provided
    const generatedSRSUniqueCode =
      SRSUniqueCode || Math.floor(100000 + Math.random() * 900000);

    // Create a new question instance and save it
    const newQuestion = new Question({
      SRSUniqueCode: generatedSRSUniqueCode,
      subjectType: cleanedSubjectType,
      enterQuestion: cleanedEnterQuestion,
      questions: cleanedQuestions,
      url,
      hitsSolution: cleanedHitsSolution,
      stream: cleanedStream,
      subTopic: cleanedSubTopic,
      skills: cleanedSkills,
      tags: cleanedTags,
      level: cleanedLevel,
      createdBy,
      createdOn,
      updatedBy,
      updatedOn,
      active,
    });

    // Save the question to the database
    await newQuestion.save();
    res.status(201).json({
      message: "Question created successfully!",
      data: newQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error creating question",
      error: err.message,
    });
  }
};

// Get all Questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find(); // Fetch all questions from MongoDB
    if (!questions || questions.length === 0) {
      return res.status(404).json({
        message: "No questions found.",
      });
    }
    res.status(200).json(questions); // Send questions as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching questions",
      error: err.message,
    });
  }
};

// Get a specific Question by ID
const getQuestionById = async (req, res) => {
  try {
    // Find a question by its ID
    const question = await Question.findById(req.params.id);

    // If the question is not found, return a 404 error
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // If the question is found, return it with a 200 status
    res.status(200).json(question);
  } catch (err) {
    // Catch any other errors and return a 500 server error
    console.error(err);
    res.status(500).json({
      message: "Error fetching question",
      error: err.message,
    });
  }
};

// Update a Question by ID
// const updateQuestion = async (req, res) => {
//   const { id } = req.params; // Assuming you're using _id for the question document
//   console.log("Received ID:", id); // Debugging line

//   const {
//     enterQuestion,
//     subjectType,
//     questions,
//     url,
//     hitsSolution,
//     stream,
//     subTopic,
//     skills,
//     tags,
//     level,
//     createdBy,
//     createdOn,
//     updatedBy,
//     updatedOn,
//     active,
//   } = req.body;

//   try {
//     const updatedQuestion = await Question.findByIdAndUpdate(
//       id,
//       {
//         enterQuestion,
//         subjectType,
//         questions, // This is the updated questions array you are sending
//         url,
//         hitsSolution,
//         stream,
//         subTopic,
//         skills,
//         tags,
//         level,
//         createdBy,
//         createdOn,
//         updatedBy,
//         updatedOn,
//         active,
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedQuestion) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     res.status(200).json({
//       message: "Question updated successfully!",
//       data: updatedQuestion,
//     });
//   } catch (err) {
//     console.error("Error updating question:", err);
//     res.status(500).json({
//       message: "Error updating question",
//       error: err.message,
//     });
//   }
// };

const updateQuestion = async (req, res) => {
  const { id } = req.params; // Extract the ID from the URL
  console.log("Received ID:", id); // For debugging purposes

  const {
    enterQuestion,
    subjectType,
    questions, // Assuming this is the updated array of questions
    url,
    hitsSolution,
    stream,
    subTopic,
    skills,
    tags,
    level,
    createdBy,
    createdOn,
    updatedBy,
    updatedOn,
    active,
  } = req.body;

  try {
    // Ensure enterQuestion is a string and sanitize
    const cleanedEnterQuestion =
      typeof enterQuestion === "string"
        ? sanitizeHtml(enterQuestion, {
            allowedTags: [], // Don't allow any HTML tags
          })
        : ""; // Default to an empty string if not valid

    // If subjectType is an array, convert it to a string (comma-separated)
    const cleanedSubjectType = Array.isArray(subjectType)
      ? subjectType.join(", ")
      : subjectType;

    // Sanitize the questions array
    const cleanedQuestions =
      questions && Array.isArray(questions)
        ? questions.map(q => {
            return {
              ...q,
              trueFalseAnswer:
                q.trueFalseAnswer === "true"
                  ? true
                  : q.trueFalseAnswer === "false"
                  ? false
                  : null, // Convert to boolean
              questionContent:
                typeof q.questionContent === "string"
                  ? sanitizeHtml(q.questionContent, { allowedTags: [] })
                  : "", // Remove HTML tags
              options: q.options.map(option => {
                // Sanitize each option to strip out HTML tags
                return typeof option === "string"
                  ? sanitizeHtml(option, { allowedTags: [] })
                  : option;
              }),

              subjectiveAnswerFormat:
                typeof q.subjectiveAnswerFormat === "string"
                  ? sanitizeHtml(q.subjectiveAnswerFormat, { allowedTags: [] })
                  : "", // Sanitize subjectiveAnswerFormat
            };
          })
        : [];

    // Ensure hitsSolution is a string and sanitize it
    const cleanedHitsSolution =
      typeof hitsSolution === "string"
        ? sanitizeHtml(hitsSolution, { allowedTags: [] })
        : ""; // Default to empty string if not a valid string

    // If stream, subTopic, and other fields are arrays, convert them to comma-separated strings
    const cleanedStream = Array.isArray(stream) ? stream.join(", ") : stream;
    const cleanedSubTopic = Array.isArray(subTopic)
      ? subTopic.join(", ")
      : subTopic;
    const cleanedSkills = Array.isArray(skills) ? skills.join(", ") : skills;
    const cleanedTags = Array.isArray(tags) ? tags.join(", ") : tags;
    const cleanedLevel = Array.isArray(level) ? level.join(", ") : level;

    // Update the question document in the database
    const updatedQuestion = await Question.findByIdAndUpdate(
      id, // The question's ID from the URL
      {
        enterQuestion: cleanedEnterQuestion,
        subjectType: cleanedSubjectType,
        questions: cleanedQuestions,
        url: sanitizeHtml(url, { allowedTags: [] }), // Sanitize URL
        hitsSolution: cleanedHitsSolution,
        stream: cleanedStream,
        subTopic: cleanedSubTopic,
        skills: cleanedSkills,
        tags: cleanedTags,
        level: cleanedLevel,
        createdBy,
        createdOn,
        updatedBy,
        updatedOn,
        active,
      },
      { new: true } // Return the updated document instead of the old one
    );

    // If no question was found with the given ID, return a 404
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Send the updated question data back to the client
    res.status(200).json({
      message: "Question updated successfully!",
      data: updatedQuestion, // Send back the updated data
    });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({
      message: "Error updating question",
      error: err.message, // Send back the error message
    });
  }
};

// const updateQuestion = async (req, res) => {
//   const { id } = req.params; // Get the question ID from the URL
//   const updatedData = req.body; // Get the data to update from the body

//   try {
//     // Find the question by ID and update it

//     // Debugging: Check if id and updatedData exist
//     console.log("Updating question with ID:", id);
//     console.log("Updated data:", updatedData);
//     const updatedQuestion = await Question.findByIdAndUpdate(id, updatedData, {
//       new: true,
//     });

//     if (!updatedQuestion) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     res.status(200).json({
//       message: "Question updated successfully!",
//       data: updatedQuestion,
//     });
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({ message: "Error updating question" });
//   }
// };

// const updateQuestion = async (req, res) => {
//   const { SRSUniqueCode } = req.params; // Get the SRSUniqueCode from the URL
//   const updatedData = req.body; // Get the data to update from the body

//   try {
//     // Find the question by SRSUniqueCode and update it
//     const updatedQuestion = await Question.findOneAndUpdate(
//       { SRSUniqueCode: SRSUniqueCode },
//       updatedData,
//       { new: true }
//     );

//     if (!updatedQuestion) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     res.status(200).json({
//       message: "Question updated successfully!",
//       data: updatedQuestion,
//     });
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({ message: "Error updating question" });
//   }
// };

//updated data

// const updateQuestion = async (req, res) => {
//   const { SRSUniqueCode, ...updateData } = req.body;

//   // Validate SRSUniqueCode
//   if (typeof SRSUniqueCode === "undefined" || SRSUniqueCode === "") {
//     return res.status(400).json({ error: "SRSUniqueCode is required" });
//   }

//   // If it's supposed to be a number, validate and convert it
//   if (isNaN(SRSUniqueCode)) {
//     return res
//       .status(400)
//       .json({ error: "Invalid SRSUniqueCode. Must be a number." });
//   }

//   try {
//     // Attempt to update the question by SRSUniqueCode
//     const updatedQuestion = await Question.findOneAndUpdate(
//       { SRSUniqueCode: Number(SRSUniqueCode) }, // Convert SRSUniqueCode to number if it should be a number
//       updateData,
//       { new: true } // `new: true` will return the updated document
//     );

//     // If no question is found, send an error response
//     if (!updatedQuestion) {
//       return res.status(404).json({ error: "Question not found" });
//     }

//     // Return the updated question
//     res.status(200).json(updatedQuestion);
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({ error: "Error updating question" });
//   }
// };

// const updateQuestion = async (req, res) => {
//   try {
//     const { SRSUniqueCode } = req.params; // Access SRSUniqueCode from the URL parameter
//     const updatedData = req.body; // Get the updated data from the body

//     const question = await Question.findOneAndUpdate(
//       { SRSUniqueCode: SRSUniqueCode }, // Use SRSUniqueCode for the query
//       { $set: updatedData }, // Update the question with the new data
//       { new: true } // Return the updated document
//     );

//     if (!question) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     res.status(200).json(question); // Send back the updated question
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({ message: "Error updating question" });
//   }
// };

// Delete a Question by ID
const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting question",
      error: err.message,
    });
  }
};

// Get Questions by Stream (Optional Filter Example)
const getQuestionsByStream = async (req, res) => {
  const { stream } = req.params;
  try {
    // Assuming stream is an array, checking for partial matches with $in
    const questions = await Question.find({
      stream: { $in: stream.split(",") },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        message: "No questions found for the specified stream",
      });
    }
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching questions by stream",
      error: err.message,
    });
  }
};

// Get Questions by Subject (Optional Filter Example)
const getQuestionsBySubject = async (req, res) => {
  const { subjectType } = req.params;
  try {
    // Assuming subjectType is a comma-separated string
    const questions = await Question.find({
      subjectType: { $in: subjectType.split(",") },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        message: "No questions found for the specified subject",
      });
    }
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching questions by subject",
      error: err.message,
    });
  }
};

// Controller to filter questions by stream
// Controller function to filter questions by stream
const filterQuestionsByStream = async (req, res) => {
  const { stream } = req.query; // Get the 'stream' from query parameters

  try {
    // Check if 'stream' parameter is provided in the query
    if (!stream) {
      return res.status(400).json({ message: "Stream parameter is required" });
    }

    // Use regular expression to match stream field containing the provided value
    const filteredQuestions = await Question.find({
      stream: { $regex: new RegExp(stream, "i") }, // Case-insensitive search
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this stream" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsBySubjectType = async (req, res) => {
  const { subjectType } = req.query; // Get the 'subjectType' from query parameters

  try {
    // Step 1: Check if 'subjectType' parameter is provided in the query
    if (!subjectType) {
      return res
        .status(400)
        .json({ message: "SubjectType parameter is required" });
    }

    // Step 2: Use regular expression to match subjectType field containing the provided value
    const filteredQuestions = await Question.find({
      subjectType: { $regex: new RegExp(subjectType, "i") }, // Case-insensitive search
    });

    // Step 3: If no questions are found, return a 404 error
    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this subjectType" });
    }

    // Step 4: If questions are found, return them as JSON response
    return res.status(200).json(filteredQuestions);
  } catch (error) {
    // Step 5: If any error occurs, return a 500 error with the error message
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsByStreamAndSubjectType = async (req, res) => {
  const { stream, subjectType, subTopic, skills } = req.query; // Get 'stream', 'subjectType', 'subTopic', and 'skills' from query parameters

  try {
    // Initialize an empty filter object
    let filter = {};

    // If 'stream' is provided, add it to the filter
    if (stream) {
      filter.stream = { $regex: new RegExp(stream, "i") }; // Case-insensitive search for stream
    }

    // If 'subjectType' is provided, add it to the filter
    if (subjectType) {
      filter.subjectType = { $regex: new RegExp(subjectType, "i") }; // Case-insensitive search for subjectType
    }

    // If 'subTopic' is provided, add it to the filter
    if (subTopic) {
      filter.subTopic = { $regex: new RegExp(subTopic, "i") }; // Case-insensitive search for subTopic
    }

    // If 'skills' is provided, add it to the filter
    if (skills) {
      filter.skills = { $regex: new RegExp(skills, "i") }; //
    }

    // Log the final filter object to debug the query
    console.log("Filter Object:", filter);

    // Fetch questions based on the constructed filter
    const filteredQuestions = await Question.find(filter);

    // If no questions are found, return a 404 status with a message
    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the selected filters" });
    }

    // If questions are found, return them as the response
    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

const filterQuestionsBySubTopic = async (req, res) => {
  const { subTopic } = req.query; // Get the 'subTopic' from query parameters

  try {
    // Step 1: Check if 'subTopic' parameter is provided in the query
    if (!subTopic) {
      return res
        .status(400)
        .json({ message: "SubTopic parameter is required" });
    }

    // Step 2: Use regular expression to match subTopic field containing the provided value
    const filteredQuestions = await Question.find({
      subTopic: { $regex: new RegExp(subTopic, "i") }, // Case-insensitive search
    });

    // Step 3: If no questions are found, return a 404 error
    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this subTopic" });
    }

    // Step 4: If questions are found, return them as JSON response
    return res.status(200).json(filteredQuestions);
  } catch (error) {
    // Step 5: If any error occurs, return a 500 error with the error message
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsBySkill = async (req, res) => {
  const { skill } = req.query; // Get the 'skill' from query parameters

  try {
    // Check if 'skill' parameter is provided in the query
    if (!skill) {
      return res.status(400).json({ message: "Skill parameter is required" });
    }

    // Use regular expression to match skill field containing the provided value
    const filteredQuestions = await Question.find({
      skills: { $regex: new RegExp(skill, "i") }, // Assuming 'skills' is an array or string field
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this skill" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsByLevel = async (req, res) => {
  const { level } = req.query; // Get the 'level' from query parameters

  try {
    // Check if 'level' parameter is provided in the query
    if (!level) {
      return res.status(400).json({ message: "Level parameter is required" });
    }

    // Use regular expression to match level field containing the provided value
    const filteredQuestions = await Question.find({
      level: { $regex: new RegExp(level, "i") }, // Assuming 'level' is a string field
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this level" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsByType = async (req, res) => {
  const { questionType } = req.query; // Get the 'questionType' from query parameters

  try {
    if (!questionType) {
      return res
        .status(400)
        .json({ message: "QuestionType parameter is required" });
    }

    // Look for `questionType` inside the `questions` array
    const filteredQuestions = await Question.find({
      "questions.questionType": { $regex: new RegExp(questionType, "i") },
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this question type" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsByStatus = async (req, res) => {
  const { status } = req.query; // Get the 'status' from query parameters

  try {
    // Check if 'status' parameter is provided in the query
    if (!status) {
      return res.status(400).json({ message: "Status parameter is required" });
    }

    // Convert status to boolean (assuming "active" means true and "inactive" means false)
    const isActive = status.toLowerCase() === "active" ? true : false;

    // Use the status to filter the questions
    const filteredQuestions = await Question.find({
      active: isActive,
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this status" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsBySRSUniqueCode = async (req, res) => {
  const { SRSUniqueCode } = req.query; // Get the 'SRSUniqueCode' from query parameters

  try {
    // Check if 'SRSUniqueCode' parameter is provided in the query
    if (!SRSUniqueCode) {
      return res
        .status(400)
        .json({ message: "SRSUniqueCode parameter is required" });
    }

    // Use the SRSUniqueCode to filter the questions
    const filteredQuestions = await Question.find({
      SRSUniqueCode: SRSUniqueCode,
    });

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this SRSUniqueCode" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};
const filterQuestionsByEnterQuestion = async (req, res) => {
  const { enterQuestion } = req.query;

  try {
    if (!enterQuestion) {
      return res
        .status(400)
        .json({ message: "enterQuestion parameter is required" });
    }

    // Log the search term
    console.log("Searching for:", enterQuestion);

    // Query to search for the term in the enterQuestion array
    const filteredQuestions = await Question.find({
      enterQuestion: { $elemMatch: { $regex: new RegExp(enterQuestion, "i") } },
    });

    console.log("Found questions:", filteredQuestions);

    if (filteredQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this search term" });
    }

    return res.status(200).json(filteredQuestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};

const resetFilters = async (req, res) => {
  try {
    // Fetch all questions without applying any filters (no query parameters)
    const allQuestions = await Question.find(); // This fetches all documents in the "Question" collection

    // If no questions are found, return a 404 response
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    // Return the fetched questions as a JSON response
    return res.status(200).json(allQuestions); // All questions are returned here, no filters applied
  } catch (error) {
    // If any error occurs, return a 500 error with the error message
    return res.status(500).json({
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByStream,
  getQuestionsBySubject,
  filterQuestionsByStream,
  filterQuestionsBySubjectType,
  filterQuestionsByStreamAndSubjectType,
  filterQuestionsBySubTopic,
  filterQuestionsBySkill,
  filterQuestionsByLevel,
  filterQuestionsByType,
  filterQuestionsByStatus,
  filterQuestionsBySRSUniqueCode,
  filterQuestionsByEnterQuestion,
  resetFilters,
};
