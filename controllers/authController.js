const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const sendResponse = require("../utils/responseHandler");
const errorHandler = require("../utils/errorHandler");
const { sendLoginNotification } = require("../utils/mailer");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");


const cleanupUploadedFile = (req) => {
  if (req.file && req.file.public_id) {
    cloudinary.uploader.destroy(req.file.public_id, (err) => {
      if (err) console.error("Failed to delete from cloudinary:", err.message);
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      cleanupUploadedFile(req);
      return sendResponse(res, 400, false, "All fields are required");
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      cleanupUploadedFile(req);
      return sendResponse(res, 400, false, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, { folder: "avatars" });
      imagePath = uploadResult.secure_url;
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      image: imagePath,
    });

    return sendResponse(res, 201, true, "User registered successfully", {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      image: newUser.image,
    });
  } catch (error) {
    cleanupUploadedFile(req);
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    sendLoginNotification(foundUser.email, foundUser.name);

    return sendResponse(res, 200, true, "User logged in successfully", {
      token,
      id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.image,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

module.exports = { register, login };
