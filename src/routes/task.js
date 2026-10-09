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
  addComment,
} = require("../controllers/taskController");

/**
 * @swagger
 * /api/private/tasks:
 *   post:
 *     summary: Create a new task (Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
tasksRouter.post("/", authMiddleware, roleMiddleware(["manager"]), createTask);

/**
 * @swagger
 * /api/private/tasks/all:
 *   post:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
tasksRouter.post("/all", authMiddleware, getTasks);

/**
 * @swagger
 * /api/private/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task data
 *       404:
 *         description: Task not found
 */
tasksRouter.get("/:id", authMiddleware, getTaskById);

/**
 * @swagger
 * /api/private/tasks/update/{id}:
 *   put:
 *     summary: Update task (Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
tasksRouter.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateTask
);

/**
 * @swagger
 * /api/private/tasks/{id}:
 *   delete:
 *     summary: Delete task (Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
tasksRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteTask
);



/**
 * @swagger
 * /api/private/tasks/comments:
 *   post:
 *     summary: Add comment to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comment added
 */
tasksRouter.post("/comments", authMiddleware, addComment);



module.exports = tasksRouter;
