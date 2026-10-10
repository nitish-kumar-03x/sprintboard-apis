const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { sendLoginNotification } = require("../utils/mailer");
const { uploadToCloudinary, cloudinary } = require("../config/cloudinary");
const CustomError = require("../utils/CustomError");
const { sendOTPEmail } = require("../utils/mailer");

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

  const [existingUserRows] = await pool.query(
    "SELECT * FROM Users WHERE email = ?",
    [normalizedEmail],
  );

  if (existingUserRows.length > 0) {
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

  const [insertResult] = await pool.query(
    "INSERT INTO Users (name, email, password, role, image) VALUES (?, ?, ?, ?, ?)",
    [name, normalizedEmail, hashedPassword, role, imagePath],
  );

  return {
    id: insertResult.insertId,
    name,
    email: normalizedEmail,
    role,
    image: imagePath,
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new CustomError("All fields are required", 400);
  }

  const normalizedEmail = email.toLowerCase();

  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?", [
    normalizedEmail,
  ]);
  const foundUser = rows[0];

  if (!foundUser) {
    throw new CustomError("User Not Found", 400);
  }

  const isPasswordMatched = await bcrypt.compare(password, foundUser.password);

  if (!isPasswordMatched) {
    throw new CustomError("Email or Password is Incorrect", 400);
  }

  const payload = {
    id: foundUser.id,
    email: foundUser.email,
    role: foundUser.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Background task, no need to wait
  sendLoginNotification(foundUser.email, foundUser.name).catch((err) =>
    console.error("Login notification failed:", err.message),
  );

  return {
    token,
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
    avatar: foundUser.image,
  };
};

const forgotPassword = async (email) => {
  if (!email) throw new CustomError("Email is required", 400);
  const normalizedEmail = email.toLowerCase();

  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?", [
    normalizedEmail,
  ]);
  const user = rows[0];
  if (!user) throw new CustomError("User not found", 404);

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Store hashed OTP in Redis, expiring in 15 mins (900 seconds)
  await redisClient.setEx(`otp:${normalizedEmail}`, 900, hashedOtp);

  await sendOTPEmail(user.email, user.name, otp);

  return { message: "OTP sent to email" };
};

const resetPassword = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword) {
    throw new CustomError(
      "email, otp, and newPassword are required",
      400,
    );
  }

  const normalizedEmail = email.toLowerCase();
  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?", [
    normalizedEmail,
  ]);
  const user = rows[0];
  if (!user) throw new CustomError("User not found", 404);

  const storedHashedOtp = await redisClient.get(`otp:${normalizedEmail}`);
  if (!storedHashedOtp) {
    throw new CustomError("OTP session expired or not found. Please request a new one.", 400);
  }

  // Verify OTP
  const isOtpMatched = await bcrypt.compare(otp.toString(), storedHashedOtp);
  if (!isOtpMatched) {
    throw new CustomError("Invalid OTP", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE Users SET password = ? WHERE id = ?", [
    hashedPassword,
    user.id,
  ]);

  // Remove the OTP from Redis once used
  await redisClient.del(`otp:${normalizedEmail}`);

  return { message: "Password updated successfully" };
};

module.exports = {
  forgotPassword,
  resetPassword,
  registerUser,
  loginUser,
  cleanupUploadedFile,
};
