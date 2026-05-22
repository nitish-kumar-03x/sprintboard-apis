const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
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
