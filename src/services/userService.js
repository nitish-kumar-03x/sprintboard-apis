const pool = require("../config/database");
const CustomError = require("../utils/CustomError");

const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, image, createdAt, updatedAt FROM Users WHERE id = ?",
    [id]
  );
  
  const userDetails = rows[0];

  if (!userDetails) {
    throw new CustomError("User not found", 404);
  }

  return userDetails;
};

const getAllUsers = async () => {
  const [users] = await pool.query(
    "SELECT id, id as _id, name, email, role FROM Users"
  );
  return users;
};

module.exports = { getUserById, getAllUsers };
