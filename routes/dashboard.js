const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const dashboardRouter = express.Router();

/**
 * @swagger
 * /api/private/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 */
dashboardRouter.get("/", authMiddleware, getDashboard);

module.exports = dashboardRouter;
