const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const tasksRouter = express.Router();
const { createTask, getTasks } = require("../controllers/taskController");

tasksRouter.post(
  "/create-task",
  authMiddleware,
  roleMiddleware(["manager"]),
  createTask,
);
tasksRouter.get("/get-tasks", authMiddleware, getTasks);

module.exports = tasksRouter;
