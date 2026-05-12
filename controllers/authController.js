const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendResponse(res, 400, false, "All fields are required");
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return sendResponse(res, 400, false, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return sendResponse(res, 201, true, "User registered successfully", {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "All fields are required");
    }

    const normalizedEmail = email.toLowerCase();

    const foundUser = await User.findOne({ email: normalizedEmail });

    if (!foundUser) {
      return sendResponse(res, 400, false, "User Not Found");
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      foundUser.password,
    );

    if (!isPasswordMatched) {
      return sendResponse(res, 400, false, "Email or Password is Incorrect");
    }

    const payload = {
      id: foundUser._id,
      email: foundUser.email,
      role: foundUser.role,
    };

    const stoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return sendResponse(res, 200, true, "User logged in successfully", {
      stoken,
      id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { register, login };
