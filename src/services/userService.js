const pool = require("../config/database");
const CustomError = require("../utils/CustomError");

const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, image, theme, createdAt, updatedAt FROM Users WHERE id = ?",
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

const updateTheme = async (id, theme) => {
  if (!['light', 'dark'].includes(theme)) {
    throw new CustomError("Invalid theme", 400);
  }
  await pool.query("UPDATE Users SET theme = ? WHERE id = ?", [theme, id]);
  return { theme };
};


const { uploadToCloudinary } = require("../config/cloudinary");

const updateUser = async (id, data, file) => {
  const { name } = data;
  const updates = [];
  const params = [];

  if (name) {
    updates.push("name = ?");
    params.push(name);
  }

  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, { folder: "avatars" });
    updates.push("image = ?");
    params.push(uploadResult.secure_url);
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  return getUserById(id);
};

module.exports = { updateUser,  getUserById, getAllUsers, updateTheme };
