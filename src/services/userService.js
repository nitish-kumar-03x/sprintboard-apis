const User = require("../models/user");
const CustomError = require("../utils/CustomError");

const getUserById = async (id) => {
  const userDetails = await User.findById(id).select("-password");

  if (!userDetails) {
    throw new CustomError("User not found", 404);
  }

  return userDetails;
};

const getAllUsers = async () => {
  const users = await User.find({}).select("_id name email role");
  return users;
};

module.exports = { getUserById, getAllUsers };
