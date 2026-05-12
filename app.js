const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const tasksRouter = require("./routes/task");
const dashboardRouter = require("./routes/dashboard");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

app.use("/api/public/auth", authRouter);
app.use("/api/private/users", userRouter);
app.use("/api/private/tasks", tasksRouter);
app.use("/api/private/dashboard", dashboardRouter);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server is listening on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
