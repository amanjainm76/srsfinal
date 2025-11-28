require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");

const connectDb = require("./utils/db");

app.use(cors({ origin: "*" }));
app.use(express.json());

const router = require("./router/auth-router");
const guidelineRoutes = require("./router/guideline-router");
const streamRoutes = require("./router/streamRoutes");
const subjectRoutes = require("./router/subjectRoutes");
const innerSubjectUnitRoutes = require("./router/InnerSubjectUnitRoutes");
const examRoutes = require("./router/exam-router");
const testRoutes = require("./router/testRoutes");
const difficultyLevelRoutes = require("./router/difficultyLevelRoutes");
const skillsRoutes = require("./router/skillsRoutes");
const tagRoutes = require("./router/tagRoutes");
const topicRoutes = require("./router/topicRoutes");
const subTopicRoutes = require("./router/subTopicRoutes");
const markingSchemesRoutes = require("./router/markingSchemesRoutes");
const testListRouter = require("./router/testListRouter");
const questionQRoutes = require("./router/questionQRoutes");
const TestSeriesRoutes = require("./router/testSeries-router");
const userRoutes = require("./router/userRoutes");
const courseRoutes = require("./router/studentRoutes/courseRoutes");

const studentRegistrationRoutes = require("./router/studentRegistrationRoutes");
const assignmentRoutes = require("./router/studentRoutes/assignmentRoutes");
const practiceRoutes = require("./router/studentRoutes/practiceRoutes");
const testStudentRoutes = require("./router/studentRoutes/testStudentRoutes");
const studentMaterialRoutes = require("./router/studentRoutes/studentMaterialRoutes");

const corsOption = {
  method: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credential: true,
};
app.use(cors(corsOption));

// Static file serving for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(express.json({ limit: "10mb" }));

// Create upload directories if they don't exist
const uploadDirs = ["uploads/profile-images", "assets/backend-img"];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});
// Handle multer errors
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }
  next(err);
});

app.use("/api/auth", router);
app.use("/api/auth/guideline", guidelineRoutes);
app.use("/api/auth/stream", streamRoutes);
app.use("/api/auth/subjects", subjectRoutes);
app.use("/api/auth/innerSubjectUnits", innerSubjectUnitRoutes);
app.use("/api/auth/exam", examRoutes);
app.use("/api/auth/test", testRoutes);
app.use("/api/auth/difficultyLevel", difficultyLevelRoutes);
app.use("/api/auth/skills", skillsRoutes);
app.use("/api/auth/tags", tagRoutes);
app.use("/api/auth/topic", topicRoutes);
app.use("/api/auth/subtopic", subTopicRoutes);
app.use("/api/auth/markingSchemes", markingSchemesRoutes);
app.use("/api/auth/", testListRouter);
app.use("/api/auth/", questionQRoutes);
app.use("/api/auth/", TestSeriesRoutes);
app.use("/api/auth/", userRoutes);
app.use("/api/auth/studentRegistration", studentRegistrationRoutes);
app.use("/api/student-auth", require("./router/auth/authRoutes"));
app.use("/api/course", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/tests", testStudentRoutes);
app.use("/api/student/materials", studentMaterialRoutes);
app.get("/api/student/materials/test", (req, res) => {
  console.log("✅ TEST ROUTE HIT");
  res.json({ success: true, message: "Test route works" });
});

app.use("/api/materials", require("./router/adminMaterialRoutes"));
app.use("/api", require("./router/studentRegistrationRoutes"));

console.log("All routes registered");
const errorMiddleware = require("./middleware/error-middleware");

app.use(errorMiddleware);

const PORT = 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at port : ${PORT}`);
  });
});
