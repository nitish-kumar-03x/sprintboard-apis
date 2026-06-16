const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["manager", "employee"],
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);
const user = new mongoose.model("User", userSchema);

module.exports = user;
