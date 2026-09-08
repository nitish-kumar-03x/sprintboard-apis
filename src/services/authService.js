const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendLoginNotification } = require("../utils/mailer");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const CustomError = require("../utils/CustomError");

const cleanupUploadedFile = (file) => {
  if (file && file.public_id) {
    cloudinary.uploader.destroy(file.public_id, (err) => {
      if (err) console.error("Failed to delete from cloudinary:", err.message);
    });
  }
};

const registerUser = async (data, file) => {
  const { name, email, password, role } = data;

  if (!name || !email || !password || !role) {
    cleanupUploadedFile(file);
    throw new CustomError("All fields are required", 400);
  }

  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    cleanupUploadedFile(file);
    throw new CustomError("Email already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let imagePath = null;
  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, {
      folder: "avatars",
    });
    imagePath = uploadResult.secure_url;
  }

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    image: imagePath,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    image: newUser.image,
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new CustomError("All fields are required", 400);
  }

  const normalizedEmail = email.toLowerCase();

  const foundUser = await User.findOne({ email: normalizedEmail });

  if (!foundUser) {
    throw new CustomError("User Not Found", 400);
  }

  const isPasswordMatched = await bcrypt.compare(password, foundUser.password);

  if (!isPasswordMatched) {
    throw new CustomError("Email or Password is Incorrect", 400);
  }

  const payload = {
    id: foundUser._id,
    email: foundUser.email,
    role: foundUser.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Background task, no need to wait
  sendLoginNotification(foundUser.email, foundUser.name).catch((err) =>
    console.error("Login notification failed:", err.message)
  );

  return {
    token,
    id: foundUser._id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
    avatar: foundUser.image,
  };
};

module.exports = {
  registerUser,
  loginUser,
  cleanupUploadedFile,
};
