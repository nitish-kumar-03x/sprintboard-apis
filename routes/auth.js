const express = require("express");
const authRouter = express.Router();
const multerUploader = require("../middlewares/uploadMiddleware");
const { register, login } = require("../controllers/authController");

authRouter.post("/register", multerUploader.single("avatar"), register);
authRouter.post("/login", login);

module.exports = authRouter;
