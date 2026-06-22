const Question = require("../models/questions-modal");
const sanitizeHtml = require("sanitize-html");
const mongoose = require("mongoose");

/* =========================
   COMMON POPULATE CONFIG
========================= */
const populateFields = [
  { path: "streamId", select: "title" },
  { path: "subjectId", select: "title" },
  { path: "unitId", select: "title" },
  { path: "topicId", select: "title" },
  { path: "subTopicIds", select: "title" },
];


/* =========================
   CREATE (✅ FIXED)
========================= */
const Stream = require("../models/stream-modal");
const Subject = require("../models/subject-modal");
const Unit = require("../models/inner-subjectUnit-modal");
const Topic = require("../models/topic-modal");
const SubTopic = require("../models/sub-topic-modal");

const createQuestion = async (req, res) => {
  console.log("REQ BODY 👉", req.body);

  try {
    let {
      SRSUniqueCode,
      streamId,
      subjectId,
      unitId,
      topicId,
      subTopicIds,
      enterQuestion,
      questions,
      url,
      hitsSolution,
      skills,
      tags,
      level,
      createdBy = "super admin",
      createdOn,
      updatedBy = "super admin",
      updatedOn,
      active,
    } = req.body;

    /* =========================
       ✅ OBJECTID FIX
    ========================= */
    streamId = mongoose.Types.ObjectId.isValid(streamId)
      ? new mongoose.Types.ObjectId(streamId)
      : null;

    subjectId = mongoose.Types.ObjectId.isValid(subjectId)
      ? new mongoose.Types.ObjectId(subjectId)
      : null;

    unitId = mongoose.Types.ObjectId.isValid(unitId)
      ? new mongoose.Types.ObjectId(unitId)
      : null;

    topicId = mongoose.Types.ObjectId.isValid(topicId)
      ? new mongoose.Types.ObjectId(topicId)
      : null;

    subTopicIds = Array.isArray(subTopicIds)
      ? subTopicIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))
      : [];

    /* =========================
       ✅ FETCH MASTER DATA
    ========================= */
    const streamData = streamId ? await Stream.findById(streamId) : null;
    const subjectData = subjectId ? await Subject.findById(subjectId) : null;
    const unitData = unitId ? await Unit.findById(unitId) : null;
    const topicData = topicId ? await Topic.findById(topicId) : null;

    const subTopicsData = subTopicIds.length
      ? await SubTopic.find({ _id: { $in: subTopicIds } })
      : [];

    /* =========================
       ✅ BUILD SNAPSHOT OBJECTS
    ========================= */
    const stream = streamData
      ? {
        id: streamData._id,
        name: streamData.title,
        code: streamData.code || null,
      }
      : null;

    const subject = subjectData
      ? {
        id: subjectData._id,
        name: subjectData.title,
        code: subjectData.code || null,
      }
      : null;

    const unit = unitData
      ? {
        id: unitData._id,
        name: unitData.title,
        code: unitData.code || null,
      }
      : null;

    const topic = topicData
      ? {
        id: topicData._id,
        name: topicData.title,
        code: topicData.code || null,
      }
      : null;

    const subTopics = subTopicsData.map((st) => ({
      id: st._id,
      name: st.title,
      code: st.code || null,
    }));

    /* =========================
       ✅ TYPE FIXES
    ========================= */
    skills = Array.isArray(skills) ? skills : [];
    /*tags = Array.isArray(tags) ? tags : tags ? [tags] : [];*/
    level = Array.isArray(level) ? level : level ? [level] : [];

    tags = Array.isArray(tags)
      ? tags.filter(t => t && t.trim() !== "")
      : typeof tags === "string" && tags.trim() !== ""
        ? [tags.trim()]
        : [];

    /* =========================
       ✅ HTML SANITIZE
    ========================= */
    const cleanHTML = (html) => {
      if (!html) return "";
      return sanitizeHtml(html, {
        allowedTags: ["b", "i", "em", "strong", "p", "ul", "ol", "li", "br"],
        allowedAttributes: {},
      });
    };

    const cleanedEnterQuestion = cleanHTML(enterQuestion);

    const cleanedHitsSolution = hitsSolution
      ? [cleanHTML(hitsSolution)]
      : [];

    /* =========================
       ✅ CLEAN QUESTIONS ARRAY
    ========================= */
    const cleanedQuestions = Array.isArray(questions)
      ? questions.map((q) => ({
        ...q,

        comprehensionText: Array.isArray(q.comprehensionText)
          ? q.comprehensionText
            .filter(
              (subQ) =>
                subQ.subQuestionType &&
                ["Comprehension SCQ", "Comprehension MCQ"].includes(
                  subQ.subQuestionType
                )
            )
            .map((subQ) => ({
              ...subQ,

              isActiveC:
                subQ.isActiveC === true ||
                subQ.isActiveC === "true",

              enterQuestionC: cleanHTML(subQ.enterQuestionC),

              optionsC: (subQ.optionsC || []).map((opt) =>
                typeof opt === "string"
                  ? cleanHTML(opt)
                  : opt
              ),

              hintsSolutionC: cleanHTML(
                subQ.hintsSolutionC
              ),
            }))
          : [],

        trueFalseAnswer:
          q.trueFalseAnswer === "true"
            ? true
            : q.trueFalseAnswer === "false"
              ? false
              : undefined,

        options: (q.options || []).map((opt) =>
          typeof opt === "string"
            ? cleanHTML(opt)
            : opt
        ),

        subjectiveAnswerFormat: cleanHTML(
          q.subjectiveAnswerFormat
        ),
      }))
      : [];



    // Generate Subject Prefix (PHY, CHE, MAT, etc.)
    const subjectPrefix = subjectData?.title
      ? subjectData.title.substring(0, 3).toUpperCase()
      : "GEN";

    // Generate random 8 digit number
    const randomNumber = Math.floor(
      10000000 + Math.random() * 90000000
    );

    const generatedSRSCode = `${subjectPrefix}${randomNumber}`;

    /* =========================
       ✅ CREATE DOC (UPDATED STRUCTURE)
    ========================= */
    const newQuestion = new Question({
      SRSUniqueCode:generatedSRSCode,

      stream,
      subject,
      unit,
      topic,
      subTopics,

      enterQuestion: cleanedEnterQuestion,
      questions: cleanedQuestions,

      url,
      hitsSolution: cleanedHitsSolution,

      skills,
      tags,
      level,

      createdBy,
      createdOn,
      updatedBy,
      updatedOn,
      active,
    });

    await newQuestion.save();

    res.status(201).json({
      message: "Created",
      data: newQuestion,
    });

  } catch (err) {
    console.error("CREATE ERROR ❌", err);
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   GET ALL (🔥 POPULATE ADDED)
========================= */
const getAllQuestions = async (req, res) => {
  try {
    const data = await Question.find().populate(populateFields);
    console.log("API DATA : ", data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET BY ID
========================= */
const getQuestionById = async (req, res) => {
  try {
    const data = await Question.findById(req.params.id).populate(populateFields);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE
========================= */
const updateQuestion = async (req, res) => {
  try {
    console.log(
      "UPDATE BODY => ",
      JSON.stringify(req.body, null, 2)
    );

    let {
      streamId,
      subjectId,
      unitId,
      topicId,
      subTopicIds,

      enterQuestion,
      questions,

      url,
      hitsSolution,
      skills,
      tags,
      level,

      updatedBy,
      updatedOn,
      active,
    } = req.body;

    /* =========================
       OBJECTID FIX
    ========================= */

    streamId = mongoose.Types.ObjectId.isValid(streamId)
      ? new mongoose.Types.ObjectId(streamId)
      : null;

    subjectId = mongoose.Types.ObjectId.isValid(subjectId)
      ? new mongoose.Types.ObjectId(subjectId)
      : null;

    unitId = mongoose.Types.ObjectId.isValid(unitId)
      ? new mongoose.Types.ObjectId(unitId)
      : null;

    topicId = mongoose.Types.ObjectId.isValid(topicId)
      ? new mongoose.Types.ObjectId(topicId)
      : null;

    subTopicIds = Array.isArray(subTopicIds)
      ? subTopicIds
        .filter(id =>
          mongoose.Types.ObjectId.isValid(id)
        )
        .map(
          id => new mongoose.Types.ObjectId(id)
        )
      : [];

    /* =========================
       FETCH MASTER DATA
    ========================= */

    const streamData = streamId
      ? await Stream.findById(streamId)
      : null;

    const subjectData = subjectId
      ? await Subject.findById(subjectId)
      : null;

    const unitData = unitId
      ? await Unit.findById(unitId)
      : null;

    const topicData = topicId
      ? await Topic.findById(topicId)
      : null;

    const subTopicsData = subTopicIds.length
      ? await SubTopic.find({
        _id: { $in: subTopicIds },
      })
      : [];

    /* =========================
       SNAPSHOT OBJECTS
    ========================= */

    const stream = streamData
      ? {
        id: streamData._id,
        name: streamData.title,
        code: streamData.code || null,
      }
      : null;

    const subject = subjectData
      ? {
        id: subjectData._id,
        name: subjectData.title,
        code: subjectData.code || null,
      }
      : null;

    const unit = unitData
      ? {
        id: unitData._id,
        name: unitData.title,
        code: unitData.code || null,
      }
      : null;

    const topic = topicData
      ? {
        id: topicData._id,
        name: topicData.title,
        code: topicData.code || null,
      }
      : null;

    const subTopics = subTopicsData.map(st => ({
      id: st._id,
      name: st.title,
      code: st.code || null,
    }));

    /* =========================
       HTML SANITIZE
    ========================= */

    const cleanHTML = html => {
      if (!html) return "";

      return sanitizeHtml(html, {
        allowedTags: [
          "b",
          "i",
          "em",
          "strong",
          "p",
          "ul",
          "ol",
          "li",
          "br",
        ],
        allowedAttributes: {},
      });
    };

    /* =========================
       ARRAY FIXES
    ========================= */

    skills = Array.isArray(skills)
      ? skills
      : [];

    tags = Array.isArray(tags)
      ? tags
      : tags
        ? [tags]
        : [];

    level = Array.isArray(level)
      ? level
      : level
        ? [level]
        : [];

    hitsSolution = hitsSolution
      ? [cleanHTML(hitsSolution)]
      : [];

    /* =========================
       QUESTIONS CLEANING
    ========================= */

    const cleanedQuestions = Array.isArray(
      questions
    )
      ? questions.map(q => ({
        questionType: q.questionType,

        options: Array.isArray(q.options)
          ? q.options.map(opt =>
            cleanHTML(opt)
          )
          : [],

        correctAnswers:
          q.correctAnswers || [],

        matrixAnswer:
          q.matrixAnswer || {},

        singleInteger:
          q.singleInteger === ""
            ? undefined
            : Number(
              q.singleInteger
            ),

        fourDigit:
          q.fourDigit === ""
            ? undefined
            : Number(q.fourDigit),

        numericAnswerStartRange:
          q.numericAnswerStartRange ===
            ""
            ? undefined
            : Number(
              q.numericAnswerStartRange
            ),

        numericAnswerEndRange:
          q.numericAnswerEndRange ===
            ""
            ? undefined
            : Number(
              q.numericAnswerEndRange
            ),

        trueFalseAnswer:
          q.trueFalseAnswer ===
            "true"
            ? true
            : q.trueFalseAnswer ===
              "false"
              ? false
              : undefined,

        subjectiveAnswerFormat:
          cleanHTML(
            q.subjectiveAnswerFormat
          ),

        comprehensionText:
          Array.isArray(
            q.comprehensionText
          )
            ? q.comprehensionText.map(
              subQ => ({
                ...subQ,
                enterQuestionC:
                  cleanHTML(
                    subQ.enterQuestionC
                  ),
                hintsSolutionC:
                  cleanHTML(
                    subQ.hintsSolutionC
                  ),
              })
            )
            : [],
      }))
      : [];

    /* =========================
       UPDATE OBJECT
    ========================= */

    const updateData = {
      stream,
      subject,
      unit,
      topic,
      subTopics,

      enterQuestion:
        cleanHTML(enterQuestion),

      questions: cleanedQuestions,

      url,

      hitsSolution,

      skills,
      tags,
      level,

      active,

      updatedBy,
      updatedOn,
    };

    const updated =
      await Question.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error(
      "UPDATE ERROR => ",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   DELETE
========================= */
const deleteQuestion = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

/* =========================
   🔥 UNIVERSAL FILTER (WITH POPULATE)
========================= */
const filterQuestions = async (req, res) => {
  try {
    const {
      streamId,
      subjectId,
      unitId,
      topicId,
      subTopicId,
      level,
      skill,
      type,
      status,
      SRSUniqueCode,
      enterQuestion,
    } = req.query;

    let filter = {};


    console.log("FILTER QUERY 👉", req.query);

    // if (streamId) filter.streamId = streamId;
    // if (subjectId) filter.subjectId = subjectId;
    // if (unitId) filter.unitId = unitId;
    // if (topicId) filter.topicId = topicId;

    // if (subTopicId) {
    //   filter.subTopicIds = { $in: [subTopicId] };
    // }

    if (streamId && mongoose.Types.ObjectId.isValid(streamId)) {
      filter["stream.id"] = new mongoose.Types.ObjectId(streamId);
    }

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      filter["subject.id"] = new mongoose.Types.ObjectId(subjectId);
    }

    if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
      filter["unit.id"] = new mongoose.Types.ObjectId(unitId);
    }

    if (topicId && mongoose.Types.ObjectId.isValid(topicId)) {
      filter["topic.id"] = new mongoose.Types.ObjectId(topicId);
    }

    if (subTopicId && mongoose.Types.ObjectId.isValid(subTopicId)) {
      filter["subTopics.id"] = new mongoose.Types.ObjectId(subTopicId);
    }

    if (level) filter.level = { $regex: new RegExp(level, "i") };
    //if (skill) filter.skills = { $regex: new RegExp(skill, "i") };
        if (skill) {
      filter.skills = {
        $in: [new RegExp(skill, "i")]
      };
    }

    // if (type) {
    //   filter["questions.questionType"] = {
    //     $regex: new RegExp(type, "i"),
    //   };
    // }

    if (type) {
      filter["questions.questionType"] = type;
    }

    if (status) {
      filter.active = status === "Active";
    }

    if (SRSUniqueCode) {
      filter.SRSUniqueCode = {
        $regex: new RegExp(SRSUniqueCode, "i"),
      };
    }

    if (enterQuestion) {
      filter.enterQuestion = {
        $regex: new RegExp(enterQuestion, "i"),
      };
    }

    const data = await Question.find(filter);

    //console.log("data aaya = ", data);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   OTHER ROUTES
========================= */

const filterQuestionsByStream = (req, res) => filterQuestions(req, res);
const filterQuestionsBySubjectType = (req, res) => filterQuestions(req, res);
const filterQuestionsByStreamAndSubjectType = (req, res) => filterQuestions(req, res);
const filterQuestionsBySubTopic = (req, res) => filterQuestions(req, res);
const filterQuestionsBySkill = (req, res) => filterQuestions(req, res);
const filterQuestionsByLevel = (req, res) => filterQuestions(req, res);
const filterQuestionsByType = (req, res) => filterQuestions(req, res);
const filterQuestionsByStatus = (req, res) => filterQuestions(req, res);

const filterQuestionsBySRSUniqueCode = async (req, res) => {
  const data = await Question.find({
    SRSUniqueCode: req.query.SRSUniqueCode,
  }).populate(populateFields);

  res.json(data);
};

const filterQuestionsByEnterQuestion = async (req, res) => {
  const data = await Question.find({
    enterQuestion: {
      $regex: new RegExp(req.query.enterQuestion, "i"),
    },
  }).populate(populateFields);

  res.json(data);
};

const resetFilters = async (req, res) => {
  const data = await Question.find().populate(populateFields);
  res.json(data);
};

const getQuestionsByStream = async (req, res) => {
  const data = await Question.find({
    streamId: req.params.stream,
  }).populate(populateFields);

  res.json(data);
};

const getQuestionsBySubject = async (req, res) => {
  const data = await Question.find({
    subjectId: req.params.subjectType,
  }).populate(populateFields);

  res.json(data);
};

/* =========================
   EXPORT
========================= */
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
