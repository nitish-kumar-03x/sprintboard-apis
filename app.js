const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World");
});

const server = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("DB has been connected");
  app.listen(process.env.PORT, () => {
    console.log(`http://${process.env.HOST}:${process.env.PORT}`);
  });
};

server();
