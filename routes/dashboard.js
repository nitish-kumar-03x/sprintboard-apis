const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const dashboardRouter = express.Router();

dashboardRouter.get("/", authMiddleware, getDashboard);

module.exports = dashboardRouter;
