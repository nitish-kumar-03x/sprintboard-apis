const User = require("../models/user");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const getUser = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id).select("-password");

    if (!userDetails) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "User fetched successfully", userDetails);
  } catch (error) {
    errorHandler(error, res);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("_id name email role");

    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports = { getUser, getAllUsers };
