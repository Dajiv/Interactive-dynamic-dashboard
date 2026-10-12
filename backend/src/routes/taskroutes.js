
const express = require("express");
const {
  body,
  param,
  query,
  validationResult,
} = require("express-validator");
const db = require("../db");

const router = express.Router();
const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];
const editableFields = [
  "title",
  "description",
  "status",
  "priority",
  "due_date",
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
        .array()
        .map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }

  next();
}

function isValidDueDate(value) {
  if (value === "") {
    return true;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return (
    year >= 1000 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1]
  );
}

function dueDateOrNull(value) {
  return value === "" || value === undefined ? null : value;
}

function taskIdValidation() {
  return param("id").isInt({ min: 1, max: 4294967295 }).toInt();
}

router.get(
  "/",
  [
    query("q").optional().isString().trim().isLength({ max: 255 }),
    query("status").optional().isIn(statuses),
    query("priority").optional().isIn(priorities),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const conditions = [];
      const values = [];

      if (req.query.q) {
        const searchTerm = req.query.q.replace(/[\\%_]/g, "\\$&");
        conditions.push("(title LIKE ? OR description LIKE ?)");
        values.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }
      if (req.query.status) {
        conditions.push("status = ?");
        values.push(req.query.status);
      }
      if (req.query.priority) {
        conditions.push("priority = ?");
        values.push(req.query.priority);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
      const [tasks] = await db.query(
        `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC`,
        values
      );

      res.json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/stats",
  async (req, res, next) => {
    try {
      const [rows] = await db.query(
        `SELECT
           COUNT(*) AS total,
           COALESCE(SUM(status = 'Pending'), 0) AS pending,
           COALESCE(SUM(status = 'In Progress'), 0) AS inProgress,
           COALESCE(SUM(status = 'Completed'), 0) AS completed,
           COALESCE(SUM(status != 'Completed' AND due_date < CURDATE()), 0) AS overdue
         FROM tasks`
      );

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  taskIdValidation(),
  validateRequest,
  async (req, res, next) => {
    try {
      const [tasks] = await db.query("SELECT * FROM tasks WHERE id = ?", [
        req.params.id,
      ]);

      if (tasks.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({ success: true, data: tasks[0] });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  [
    body().custom(
      (value) =>
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).every((field) =>
          ["title", "description", "status", "priority", "due_date"].includes(
            field
          )
        )
    ),
    body("title")
      .exists()
      .withMessage("Title is required")
      .bail()
      .isString()
      .withMessage("Title must be text")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Title must be at most 255 characters"),
    body("description")
      .optional({ values: "null" })
      .isString()
      .withMessage("Description must be text")
      .bail()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Description must be at most 5000 characters"),
    body("status").optional().isIn(statuses).withMessage("Invalid task status"),
    body("priority")
      .optional()
      .isIn(priorities)
      .withMessage("Invalid task priority"),
    body("due_date")
      .optional({ values: "null" })
      .custom(isValidDueDate)
      .withMessage("Due date must use YYYY-MM-DD format"),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { title, description, status, priority, due_date } = req.body;
      const [result] = await db.query(
        `INSERT INTO tasks (title, description, status, priority, due_date)
         VALUES (?, ?, ?, ?, ?)`,
        [
          title,
          description ?? null,
          status || "Pending",
          priority || "Medium",
          dueDateOrNull(due_date),
        ]
      );
      const [tasks] = await db.query("SELECT * FROM tasks WHERE id = ?", [
        result.insertId,
      ]);

      res.status(201).json({ success: true, data: tasks[0] });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  [
    taskIdValidation(),
    body().custom(
      (value) =>
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length > 0 &&
        Object.keys(value).every((field) => editableFields.includes(field))
    ),
    body("title")
      .optional()
      .isString()
      .withMessage("Title must be text")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Title must be at most 255 characters"),
    body("description")
      .optional({ values: "null" })
      .isString()
      .withMessage("Description must be text")
      .bail()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Description must be at most 5000 characters"),
    body("status").optional().isIn(statuses).withMessage("Invalid task status"),
    body("priority")
      .optional()
      .isIn(priorities)
      .withMessage("Invalid task priority"),
    body("due_date")
      .optional({ values: "null" })
      .custom(isValidDueDate)
      .withMessage("Due date must use YYYY-MM-DD format"),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const fields = [];
      const values = [];

      for (const field of editableFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          fields.push(`${field} = ?`);
          values.push(
            field === "due_date"
              ? dueDateOrNull(req.body[field])
              : req.body[field]
          );
        }
      }

      values.push(req.params.id);
      await db.query(
        `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      const [tasks] = await db.query("SELECT * FROM tasks WHERE id = ?", [
        req.params.id,
      ]);
      if (tasks.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({ success: true, data: tasks[0] });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  taskIdValidation(),
  validateRequest,
  async (req, res, next) => {
    try {
      const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({ success: true, message: "Task deleted" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
