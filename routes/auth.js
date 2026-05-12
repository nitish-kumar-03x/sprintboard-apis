const express = require("express");
const authRouter = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { register, login } = require("../controllers/authController");

authRouter.post("/register", register);
authRouter.post("/login", login);

module.exports = authRouter;
