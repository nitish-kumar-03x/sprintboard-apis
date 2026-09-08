const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = require("./app");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

const startServer = async () => {
  try {
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    await mongoose.connect(MONGO_URL);
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server is listening on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
