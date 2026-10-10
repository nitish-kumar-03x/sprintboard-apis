const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const aiRouter = express.Router();
const { generateImprovedDescription, convertSpeechToText } = require("../controllers/aiController");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

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

/**
 * @swagger
 * /api/private/ai/speech-to-text:
 *   post:
 *     summary: Convert spoken audio description to text using Gemini AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Transcribed text
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
aiRouter.post(
  "/speech-to-text",
  authMiddleware,
  uploadMiddleware.single("audio"),
  convertSpeechToText,
);

module.exports = aiRouter;
