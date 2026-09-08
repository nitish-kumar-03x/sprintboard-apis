const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const swaggerSpec = require("./utils/swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const tasksRouter = require("./routes/task");
const dashboardRouter = require("./routes/dashboard");

app.use("/api/public/auth", authRouter);
app.use("/api/private/users", userRouter);
app.use("/api/private/tasks", tasksRouter);
app.use("/api/private/dashboard", dashboardRouter);

module.exports = app;
