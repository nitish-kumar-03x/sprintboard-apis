const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const pool = mysql.createPool(process.env.DATABASE_URL);

module.exports = pool;
