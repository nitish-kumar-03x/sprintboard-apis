const user = require("../models/user");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const isEmailMatched = await user.findOne({ email: normalizedEmail });

    if (isEmailMatched) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: {name,email,role},
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { register };