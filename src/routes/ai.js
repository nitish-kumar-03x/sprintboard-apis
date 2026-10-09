const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const aiRouter = express.Router();
const { generateImprovedDescription } = require("../controllers/aiController");

/**
 * @swagger
 * /api/private/ai/improve-description:
 *   post:
 *     summary: Improve a description using Gemini AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Improved description
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
aiRouter.post(
  "/improve-description",
  authMiddleware,
  generateImprovedDescription,
);

module.exports = aiRouter;
