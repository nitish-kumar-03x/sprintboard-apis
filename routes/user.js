const express = require("express");
const userRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {getUser, getAllUsers} = require("../controllers/userController");

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
 
module.exports = userRouter;