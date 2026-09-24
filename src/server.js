const dotenv = require("dotenv");
const path = require("path");

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const pool = require("./config/database");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Check database connection
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();

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
