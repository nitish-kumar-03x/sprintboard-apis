const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const pool = require("./config/database");
const redisClient = require("./config/redis");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {

    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();

    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected successfully");
      }
    } catch (redisError) {
      console.warn("Redis connection failed:", redisError.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is listening on http://${HOST}:${PORT}`);
      console.log(`Swagger UI is available at http://${HOST}:${PORT}/docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
