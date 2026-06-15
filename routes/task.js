const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const tasksRouter = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  reassignTask,
  updateTaskStatus,
  addComment,
  updateProgress,
} = require("../controllers/taskController");

tasksRouter.post("/", authMiddleware, roleMiddleware(["manager"]), createTask);
tasksRouter.post("/all", authMiddleware, getTasks);
tasksRouter.get("/:id", authMiddleware, getTaskById);
tasksRouter.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateTask,
);
tasksRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteTask,
);
tasksRouter.post(
  "/assign",
  authMiddleware,
  roleMiddleware(["manager"]),
  assignTask,
);
tasksRouter.put(
  "/reassign",
  authMiddleware,
  roleMiddleware(["manager"]),
  reassignTask,
);
tasksRouter.put("/status", authMiddleware, updateTaskStatus);
tasksRouter.post("/comments", authMiddleware, addComment);
tasksRouter.put(
  "/progress",
  authMiddleware,
  roleMiddleware(["employee"]),
  updateProgress,
);

module.exports = tasksRouter;
