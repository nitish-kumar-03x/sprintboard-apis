const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multerUploader = require("../middlewares/uploadMiddleware");
const {
  getUser,
  updateUser,
  getAllUsers,
  updateTheme,
} = require("../controllers/userController");

/**
 * @swagger
 * /api/private/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/me", authMiddleware, getUser);

/**
 * @swagger
 * /api/private/users/all-users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/all-users", authMiddleware, getAllUsers);

/**
 * @swagger
 * /api/private/users/theme:
 *   put:
 *     summary: Update user theme preference
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theme
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *       400:
 *         description: Invalid theme
 *       401:
 *         description: Unauthorized
 */
userRouter.put("/theme", authMiddleware, updateTheme);

/**
 * @swagger
 * /api/private/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */
userRouter.put(
  "/me",
  authMiddleware,
  multerUploader.single("avatar"),
  updateUser,
);

module.exports = userRouter;
