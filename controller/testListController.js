const mongoose = require("mongoose");

const TestList = require("../models/testList-modal");
const TestSeries = require("../models/testSeries-modal");
const TestAssignment = require("../models/TestAssignment");
const ExamsType = require("../models/exam-modal");
const TestType = require("../models/test-modal");
const Guidelines = require("../models/guideline-modal");
const MarkingScheme = require("../models/marking-scheme-modal");
const Tags = require("../models/tag-modal");

// ============================================================
// Helper Functions
// ============================================================

// ------------------------------------------------------------
// Get actual ID from:
// "id"
// OR
// { id: "...", title: "..." }
// ------------------------------------------------------------
const extractId = (value) => {
  if (!value) {
    return null;
  }

  // Object format
  if (typeof value === "object" && value.id) {
    return value.id.toString();
  }

  // String / ObjectId format
  return value.toString();
};

// ============================================================
// Convert IDs array into [{ id, title }]
// Handles both:
// ["id1", "id2"]
//
// and
//
// [
//   { id: "id1", title: "Title 1" },
//   { id: "id2", title: "Title 2" }
// ]
// ============================================================

const getIdTitleArray = async (ids, Model, fieldName = "title") => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  // Extract actual IDs
  const extractedIds = ids.map((item) => extractId(item)).filter(Boolean);

  // Keep only valid MongoDB ObjectIds
  const validIds = extractedIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );

  if (validIds.length === 0) {
    return [];
  }

  const documents = await Model.find({
    _id: { $in: validIds },
  }).select(`_id ${fieldName}`);

  return extractedIds
    .map((id) => {
      const document = documents.find(
        (item) => item._id.toString() === id.toString(),
      );

      if (!document) {
        return null;
      }

      return {
        id: document._id,
        title: document[fieldName],
      };
    })
    .filter(Boolean);
};

// ============================================================
// Convert single ID into { id, title }
// Handles:
//
// "id"
//
// OR
//
// { id: "id", title: "title" }
// ============================================================

const getIdTitleObject = async (value, Model, fieldName = "title") => {
  const id = extractId(value);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const document = await Model.findById(id).select(`_id ${fieldName}`);

  if (!document) {
    return null;
  }

  return {
    id: document._id,
    title: document[fieldName],
  };
};

// ============================================================
// ATTACH ASSIGNED BATCH DETAILS TO TEST LISTS
// One query for all test assignments
// ============================================================

const attachAssignedBatches = async (testLists) => {
  if (!Array.isArray(testLists) || testLists.length === 0) {
    return [];
  }

  const testIds = testLists.map((test) => test._id);

  const assignments = await TestAssignment.find({
    test: { $in: testIds },
    status: "Assigned",
  })
    .populate({
      path: "batches.batch",
      select: "batchName center",
      populate: {
        path: "center",
        select: "centerName",
      },
    })
    .select("test batches")
    .lean();

  // Map assignments by test ID for fast lookup
  const assignmentMap = new Map();

  assignments.forEach((assignment) => {
    assignmentMap.set(assignment.test.toString(), assignment);
  });

  return testLists.map((test) => {
    const assignment = assignmentMap.get(test._id.toString());

    const assignedBatches = (assignment?.batches || [])
      .filter((item) => item.batch)
      .map((item) => ({
        batchId: item.batch._id,
        batchName: item.batch.batchName || "N/A",
        centerName: item.batch.center?.centerName || "N/A",
        studentCount: Number(item.studentCount || 0),
        assignedOn: item.assignedOn || null,
      }));

    return {
      ...test,
      assignedBatches,
      assignedBatchCount: assignedBatches.length,
    };
  });
};


// ============================================================
// CALCULATE TEST STATUS
// Draft -> Ready -> Assigned
// ============================================================

const calculateTestStatus = async (test) => {
  if (!test) {
    return "Draft";
  }

  // 1. Check assigned batches
  const assignment = await TestAssignment.findOne({
    test: test._id,
    status: "Assigned",
    "batches.0": { $exists: true },
  }).select("_id");

  if (assignment) {
    return "Assigned";
  }

  // 2. Count questions
  const sections = Array.isArray(test.sections)
    ? test.sections
    : [];

  const totalAddedQuestions = sections.reduce(
    (total, section) => {
      return total + (
        Array.isArray(section.questions)
          ? section.questions.length
          : 0
      );
    },
    0
  );

  // 3. Required question count
  const requiredQuestions = Number(test.maxQuestions || 0);

  // 4. Complete questions => Ready
  if (
    requiredQuestions > 0 &&
    totalAddedQuestions >= requiredQuestions
  ) {
    return "Ready";
  }

  // 5. Otherwise Draft
  return "Draft";
};

// ============================================================
// CREATE TEST LIST
// ============================================================

const createTestList = async (req, res) => {
  const {
    title,
    url,
    content,
    examType,
    testType,
    testInstructions,
    maxQuestions,
    duration,
    guideline,
    markingScheme,
    startDate,
    endDate,
    solutionUnlockDate,
    tags,
    isActiveHasSection,
    sections,
    createdOn,
    updatedOn,
    active,
    select,
  } = req.body;

  // ==========================================================
  // Validation
  // ==========================================================

  if (!title || !url) {
    return res.status(400).json({
      message: "Title and URL are required",
    });
  }

  if (!Array.isArray(examType) || examType.length === 0) {
    return res.status(400).json({
      message: "At least one Exam Type is required",
    });
  }

  if (!testType) {
    return res.status(400).json({
      message: "Test Type is required",
    });
  }

  if (!maxQuestions) {
    return res.status(400).json({
      message: "Maximum Questions is required",
    });
  }

  if (!duration) {
    return res.status(400).json({
      message: "Duration is required",
    });
  }

  if (!Array.isArray(guideline) || guideline.length === 0) {
    return res.status(400).json({
      message: "At least one Guideline is required",
    });
  }

  if (!Array.isArray(markingScheme) || markingScheme.length === 0) {
    return res.status(400).json({
      message: "At least one Marking Scheme is required",
    });
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({
      message: "At least one Tag is required",
    });
  }

  try {
    // ========================================================
    // 1. EXAM TYPE
    // ========================================================

    const examTypeData = await getIdTitleArray(examType, ExamsType);

    if (examTypeData.length !== examType.length) {
      return res.status(400).json({
        message: "One or more Exam Types were not found",
      });
    }

    // ========================================================
    // 2. TEST TYPE
    // ========================================================

    const testTypeData = await getIdTitleObject(testType, TestType);

    if (!testTypeData) {
      return res.status(400).json({
        message: "Test Type not found",
      });
    }

    // ========================================================
    // 3. GUIDELINES
    // ========================================================

    const guidelineData = await getIdTitleArray(guideline, Guidelines);

    if (guidelineData.length !== guideline.length) {
      return res.status(400).json({
        message: "One or more Guidelines were not found",
      });
    }

    // ========================================================
    // 4. MARKING SCHEME
    // ========================================================

    const markingSchemeData = await getIdTitleArray(
      markingScheme,
      MarkingScheme,
    );

    if (markingSchemeData.length !== markingScheme.length) {
      return res.status(400).json({
        message: "One or more Marking Schemes were not found",
      });
    }

    // ========================================================
    // 5. TAGS
    // ========================================================

    const tagsData = await getIdTitleArray(tags, Tags);

    if (tagsData.length !== tags.length) {
      return res.status(400).json({
        message: "One or more Tags were not found",
      });
    }

    // ========================================================
    // 6. SECTIONS
    // ========================================================

    const normalizedSections = Array.isArray(sections)
      ? await Promise.all(
          sections.map(async (section) => {
            const sectionGuidelineData = await getIdTitleArray(
              section.sectionGuideline || [],
              Guidelines,
            );

            const sectionMarkingSchemeData = await getIdTitleArray(
              section.sectionMarkingScheme || [],
              MarkingScheme,
            );

            return {
              sectionName: section.sectionName || "",

              sectionDescription: section.sectionDescription || "",

              sectionDisplayOrder: Number(section.sectionDisplayOrder) || 0,

              sectionMaximumQuestions:
                Number(section.sectionMaximumQuestions) || 0,

              sectionGuideline: sectionGuidelineData,

              sectionMarkingScheme: sectionMarkingSchemeData,

              // Questions
              questions: Array.isArray(section.questions)
                ? section.questions
                : [],

              isActiveSection: Boolean(section.isActiveSection),
            };
          }),
        )
      : [];

    // ========================================================
    // 7. CREATE TEST
    // ========================================================

    const newTestList = new TestList({
      title,

      url,

      content: content || "",

      testInstructions: testInstructions || "",

      examType: examTypeData,

      testType: testTypeData,

      maxQuestions: Number(maxQuestions),

      duration: Number(duration),

      guideline: guidelineData,

      markingScheme: markingSchemeData,

      startDate,

      endDate,

      solutionUnlockDate,

      tags: tagsData,

      isActiveHasSection: Boolean(isActiveHasSection),

      sections: normalizedSections,

      createdOn,

      updatedOn,

      active: Boolean(active),

      select: Boolean(select),
    });

    // New test default status
    testData.status = "Draft";

    const savedTestList = await newTestList.save();

    console.log("TEST SAVED SUCCESSFULLY:", savedTestList._id);

    return res.status(201).json({
      message: "Test created successfully",
      data: savedTestList,
    });
  } catch (error) {
    console.error("ERROR CREATING TEST LIST:", error);

    return res.status(500).json({
      message: "Error creating TestList",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL TEST LISTS WITH ASSIGNED BATCH DETAILS
// ============================================================

const getTestLists = async (req, res) => {
  try {
    const testLists = await TestList.find().lean();

    const result = await attachAssignedBatches(testLists);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching TestLists:", error);

    return res.status(500).json({
      message: "Error fetching TestLists",
      error: error.message,
    });
  }
};

// ============================================================
// GET TEST LIST BY ID
// ============================================================

const getTestListById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid TestList ID",
      });
    }

    const testList = await TestList.findById(id);

    if (!testList) {
      return res.status(404).json({
        message: "TestList not found",
      });
    }

    return res.status(200).json(testList);
  } catch (error) {
    console.error("Error fetching TestList:", error);

    return res.status(500).json({
      message: "Error fetching TestList",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE TEST LIST
// ============================================================

const updateTestList = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    url,
    content,
    examType,
    testType,
    testInstructions,
    maxQuestions,
    duration,
    guideline,
    markingScheme,
    startDate,
    endDate,
    solutionUnlockDate,
    tags,
    isActiveHasSection,
    sections,
    updatedOn,
    active,
    select,
  } = req.body;

  try {
    // ========================================================
    // Validate Test ID
    // ========================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid TestList ID",
      });
    }

    // ========================================================
    // Get Existing Test
    // IMPORTANT
    // ========================================================

    const existingTest = await TestList.findById(id);

    if (!existingTest) {
      return res.status(404).json({
        message: "TestList not found",
      });
    }

    // ========================================================
    // EXAM TYPE
    //
    // Handles:
    // ["id"]
    //
    // OR
    //
    // [{ id, title }]
    // ========================================================

    let examTypeData;

    if (Array.isArray(examType) && examType.length > 0) {
      examTypeData = await getIdTitleArray(examType, ExamsType);
    } else {
      // Preserve existing value
      examTypeData = existingTest.examType || [];
    }

    // ========================================================
    // TEST TYPE
    //
    // Handles:
    //
    // "id"
    //
    // OR
    //
    // { id, title }
    // ========================================================

    let testTypeData;

    if (testType) {
      testTypeData = await getIdTitleObject(testType, TestType);
    } else {
      testTypeData = existingTest.testType;
    }

    // ========================================================
    // GUIDELINES
    // ========================================================

    let guidelineData;

    if (Array.isArray(guideline)) {
      guidelineData = await getIdTitleArray(guideline, Guidelines);
    } else {
      guidelineData = existingTest.guideline || [];
    }

    // ========================================================
    // MARKING SCHEME
    // ========================================================

    let markingSchemeData;

    if (Array.isArray(markingScheme)) {
      markingSchemeData = await getIdTitleArray(markingScheme, MarkingScheme);
    } else {
      markingSchemeData = existingTest.markingScheme || [];
    }

    // ========================================================
    // TAGS
    // ========================================================

    let tagsData;

    if (Array.isArray(tags)) {
      tagsData = await getIdTitleArray(tags, Tags);
    } else {
      tagsData = existingTest.tags || [];
    }

    // ========================================================
    // SECTIONS
    //
    // IMPORTANT:
    // Questions are NOT converted.
    // Existing questions remain untouched.
    // ========================================================

    let normalizedSections;

    if (Array.isArray(sections)) {
      normalizedSections = await Promise.all(
        sections.map(async (section) => {
          // ----------------------------------------------
          // Section Guidelines
          // ----------------------------------------------

          const sectionGuidelineData = Array.isArray(section.sectionGuideline)
            ? await getIdTitleArray(section.sectionGuideline, Guidelines)
            : [];

          // ----------------------------------------------
          // Section Marking Scheme
          // ----------------------------------------------

          const sectionMarkingSchemeData = Array.isArray(
            section.sectionMarkingScheme,
          )
            ? await getIdTitleArray(section.sectionMarkingScheme, MarkingScheme)
            : [];

          // ----------------------------------------------
          // Questions
          //
          // IMPORTANT:
          // Don't send questions to any
          // ObjectId conversion function.
          //
          // Store exactly what frontend sends.
          // ----------------------------------------------

          const questions = Array.isArray(section.questions)
            ? section.questions
            : [];

          return {
            // Keep section Mongo ID if present
            ...(section._id
              ? {
                  _id: section._id,
                }
              : {}),

            sectionName: section.sectionName || "",

            sectionDescription: section.sectionDescription || "",

            sectionDisplayOrder: Number(section.sectionDisplayOrder) || 0,

            sectionMaximumQuestions:
              Number(section.sectionMaximumQuestions) || 0,

            sectionGuideline: sectionGuidelineData,

            sectionMarkingScheme: sectionMarkingSchemeData,

            // ==========================================
            // QUESTIONS
            // ==========================================

            questions,

            isActiveSection: Boolean(section.isActiveSection),
          };
        }),
      );
    } else {
      // If sections aren't sent,
      // preserve existing sections.

      normalizedSections = existingTest.sections || [];
    }

    // ========================================================
    // DEBUG
    // ========================================================

    console.log("======================================");

    console.log("UPDATING TEST:", id);

    console.log("TEST TYPE RECEIVED:", testType);

    console.log("TEST TYPE NORMALIZED:", testTypeData);

    console.log("SECTIONS RECEIVED:", JSON.stringify(sections, null, 2));

    console.log(
      "NORMALIZED SECTIONS:",
      JSON.stringify(normalizedSections, null, 2),
    );

    console.log("======================================");


    const updatedTestData = {
      ...existingTest.toObject(),

      title: title !== undefined ? title : existingTest.title,

      maxQuestions:
        maxQuestions !== undefined
          ? Number(maxQuestions)
          : existingTest.maxQuestions,

      sections: normalizedSections,
    };

    // Calculate status using updated data
    const calculatedStatus = await calculateTestStatus(
      updatedTestData
    );





    // ========================================================
    // UPDATE
    // ========================================================

    const updatedTestList = await TestList.findByIdAndUpdate(
      id,

      {
        title,

        url,

        content,

        examType: examTypeData,

        testType: testTypeData,

        testInstructions,

        maxQuestions:
          maxQuestions !== undefined
            ? Number(maxQuestions)
            : existingTest.maxQuestions,

        duration:
          duration !== undefined ? Number(duration) : existingTest.duration,

        guideline: guidelineData,

        markingScheme: markingSchemeData,

        startDate,

        endDate,

        solutionUnlockDate,

        tags: tagsData,

        isActiveHasSection: Boolean(isActiveHasSection),

        sections: normalizedSections,

        updatedOn,

        select: Boolean(select),

        active: Boolean(active),
        status: calculatedStatus,
      },

      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedTestList) {
      return res.status(404).json({
        message: "TestList not found",
      });
    }

    console.log("TEST UPDATED SUCCESSFULLY:", updatedTestList._id);

    return res.status(200).json(updatedTestList);
  } catch (error) {
    console.error("======================================");

    console.error("ERROR UPDATING TEST LIST:");

    console.error(error);

    console.error("======================================");

    return res.status(500).json({
      message: "Error updating TestList",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE TEST LIST
// ============================================================

const deleteTestList = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid TestList ID",
      });
    }

    const deletedTestList = await TestList.findByIdAndDelete(id);

    if (!deletedTestList) {
      return res.status(404).json({
        message: "TestList not found",
      });
    }

    return res.status(200).json({
      message: "TestList deleted successfully",

      deletedTestList,
    });
  } catch (error) {
    console.error("Error deleting TestList:", error);

    return res.status(500).json({
      message: "Error deleting TestList",
      error: error.message,
    });
  }
};

// ============================================================
// FILTER BY TEST TYPE WITH ASSIGNED BATCH DETAILS
// ============================================================

const filterTestListsByTestType = async (req, res) => {
  const { testType } = req.query;

  try {
    if (!testType) {
      return res.status(400).json({
        message: "testType parameter is required",
      });
    }

    const filteredTestLists = await TestList.find({
      "testType.id": String(testType).trim(),
    }).lean();

    const result = await attachAssignedBatches(filteredTestLists);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering tests by Test Type:", error);

    return res.status(500).json({
      message: "Error fetching test lists",
      error: error.message,
    });
  }
};


// ============================================================
// FILTER BY TEST TYPE + CONTENT WITH ASSIGNED BATCH DETAILS
// ============================================================

const filterTestListsByTestTypeAndContent = async (req, res) => {
  const { testType, content } = req.query;

  try {
    const decodedTestType = testType
      ? decodeURIComponent(testType).trim()
      : null;

    const decodedContent = content
      ? decodeURIComponent(content).trim()
      : null;

    if (!decodedTestType && !decodedContent) {
      return res.status(400).json({
        message:
          "At least one of 'testType' or 'content' parameter is required",
      });
    }

    const filter = {};

    if (decodedTestType) {
      filter["testType.id"] = decodedTestType;
    }

    if (decodedContent) {
      // Escape special regex characters entered by the user
      const escapedContent = decodedContent.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.content = {
        $regex: escapedContent,
        $options: "i",
      };
    }

    const filteredTestLists = await TestList.find(filter).lean();

    const result = await attachAssignedBatches(filteredTestLists);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering test lists:", error);

    return res.status(500).json({
      message: "Error fetching test lists",
      error: error.message,
    });
  }
};

// ============================================================
// FETCH EXAM TYPES
// ============================================================

const fetchExamType = async (req, res) => {
  try {
    const exams = await ExamsType.find();

    return res.status(200).json(exams);
  } catch (e) {
    console.error("Error fetching ExamTypes:", e);

    return res.status(500).json({
      message: "Error fetching ExamTypes",
      error: e.message,
    });
  }
};

// ============================================================
// FETCH TEST TYPES
// ============================================================

const fetchTestType = async (req, res) => {
  try {
    const tests_type = await TestType.find();

    return res.status(200).json(tests_type);
  } catch (e) {
    console.error("Error Occured During TestType Fetch");

    return res.status(500).json({
      error: e.message,

      message: "Error Occured During TestType Fetch",
    });
  }
};

// ============================================================
// FETCH GUIDELINES
// ============================================================

const fetchGuidelines = async (req, res) => {
  try {
    const guidelines_data = await Guidelines.find();

    return res.status(200).json(guidelines_data);
  } catch (e) {
    console.error("Error Occured During Guidelines Data Fetching...");

    return res.status(500).json({
      message: "Error Occured During Guidelines Data Fetching...",

      error: e.message,
    });
  }
};

// ============================================================
// FETCH MARKING SCHEME
// ============================================================

const fetchMarkingScheme = async (req, res) => {
  try {
    const markingscheme_data = await MarkingScheme.find();

    return res.status(200).json(markingscheme_data);
  } catch (e) {
    console.error("Error Occured During MarkingScheme Data Fetching...");

    return res.status(500).json({
      message: "Error Occured During MarkingScheme Data Fetching...",

      error: e.message,
    });
  }
};

// ============================================================
// FETCH TAGS
// ============================================================

const fetchTags = async (req, res) => {
  try {
    const tags_data = await Tags.find();

    return res.status(200).json(tags_data);
  } catch (e) {
    console.error("Error Occured During Tags Data Fetching...");

    return res.status(500).json({
      message: "Error Occured During Tags Data Fetching...",

      error: e.message,
    });
  }
};




// ============================================================
// GET QUESTION PAPER BY TEST ID
// Populate actual question documents
// ============================================================


const getQuestionPaperByTestId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Test ID"
      });
    }

    // Fetch Test with Questions
    const test = await TestList.findById(id)
      .populate({
        path: "sections.questions",
        model: "questions"
      })
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    // Collect all guideline IDs
    const guidelineIds = [
      ...(test.guideline || []).map(item => item.id),

      ...(test.sections || []).flatMap(section =>
        (section.sectionGuideline || []).map(item => item.id)
      )
    ]
      .filter(Boolean)
      .map(String);

    // Fetch actual guideline documents
    const guidelineDocuments = guidelineIds.length
      ? await Guidelines.find({
          _id: { $in: guidelineIds }
        }).lean()
      : [];

    // Create guideline lookup
    const guidelineMap = {};

    guidelineDocuments.forEach(item => {
      guidelineMap[String(item._id)] = item;
    });

    // Attach content to main guidelines
    test.guideline = (test.guideline || []).map(item => {
      const guideline = guidelineMap[String(item.id)];

      return {
        ...item,
        content: guideline?.content || ""
      };
    });

    // Attach content to section guidelines
    test.sections = (test.sections || [])
      .sort(
        (a, b) =>
          Number(a.sectionDisplayOrder || 0) -
          Number(b.sectionDisplayOrder || 0)
      )
      .map(section => ({
        ...section,

        sectionGuideline: (section.sectionGuideline || []).map(item => {
          const guideline = guidelineMap[String(item.id)];

          return {
            ...item,
            content: guideline?.content || ""
          };
        }),

        questions: (section.questions || []).filter(
          question =>
            question &&
            typeof question === "object" &&
            question._id
        )
      }));

    return res.status(200).json({
      success: true,
      data: test
    });

  } catch (error) {
    console.error("Question Paper Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch question paper",
      error: error.message
    });
  }
};




// ============================================================
// EXPORT
// ============================================================

module.exports = {
  filterTestListsByTestTypeAndContent,

  filterTestListsByTestType,

  createTestList,

  getTestLists,

  getTestListById,

  updateTestList,

  deleteTestList,

  fetchExamType,

  fetchTestType,

  fetchGuidelines,

  fetchMarkingScheme,

  fetchTags,
  getQuestionPaperByTestId,
};
