const authService = require("../services/authService");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body, req.file);
    return sendResponse(res, 201, true, "User registered successfully", user);
  } catch (error) {
    return errorHandler(error, res);
  }
};

const login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body);
    return sendResponse(res, 200, true, "User logged in successfully", user);
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { register, login };
