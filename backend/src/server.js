
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const taskRoutes = require("./routes/taskroutes");

const db = require("./db");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Task Dashboard API is running",
  });
});

app.get("/api/db-test", async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "MySQL connection successful",
      result: rows[0].result,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.message);

  const statusCode =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500
      ? err.status
      : 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? "Invalid request" : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
