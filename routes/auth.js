const express = require("express");
const authRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {register, login, getUser} = require("../controllers/authController");
 
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/get-user",authMiddleware, getUser);
 
module.exports = authRouter;