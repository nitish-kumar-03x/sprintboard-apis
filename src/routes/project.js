const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const projectRouter = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

/**
 * @swagger
 * /api/private/projects/add:
 *   post:
 *     summary: Create a new project (Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
projectRouter.post("/add", authMiddleware, roleMiddleware(["manager"]), createProject);

/**
 * @swagger
 * /api/private/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
projectRouter.get("/", authMiddleware, getProjects);

/**
 * @swagger
 * /api/private/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project data
 */
projectRouter.get("/:id", authMiddleware, getProjectById);

/**
 * @swagger
 * /api/private/projects/{id}:
 *   put:
 *     summary: Update project (Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 */
projectRouter.put("/:id", authMiddleware, roleMiddleware(["manager"]), updateProject);

/**
 * @swagger
 * /api/private/projects/{id}:
 *   delete:
 *     summary: Delete project (Manager only)
 *     tags: [Projects]
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
 *         description: Project deleted
 */
projectRouter.delete("/:id", authMiddleware, roleMiddleware(["manager"]), deleteProject);

module.exports = projectRouter;
