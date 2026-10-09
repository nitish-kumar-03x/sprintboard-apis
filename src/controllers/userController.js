const userService = require("../services/userService");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const getUser = async (req, res) => {
  try {
    const userDetails = await userService.getUserById(req.user.id);
    return sendResponse(
      res,
      200,
      true,
      "User fetched successfully",
      userDetails,
    );
  } catch (error) {
    return errorHandler(error, res);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const result = await userService.updateTheme(req.user.id, theme);
    return sendResponse(res, 200, true, "Theme updated successfully", result);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(
      req.user.id,
      req.body,
      req.file,
    );
    return sendResponse(
      res,
      200,
      true,
      "User updated successfully",
      updatedUser,
    );
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { updateUser, getUser, getAllUsers, updateTheme };
