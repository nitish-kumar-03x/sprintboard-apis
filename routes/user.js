const express = require("express");
const userRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {getUser, getAllUsers} = require("../controllers/userController");

userRouter.get("/me", authMiddleware, getUser);
userRouter.get("/all-users", authMiddleware, getAllUsers);
 
module.exports = userRouter;