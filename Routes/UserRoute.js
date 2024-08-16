const express = require("express");
const userRoute = express.Router();
const { User } = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authentication } = require("../Middlewares/Authentication");
const { authrised } = require("../Middlewares/authrise");
const { Product } = require("../Model/Product");

require("dotenv").config();

//register
userRoute.post("/api/signup", async (req, res) => {

  const { username, mobileNo, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ mobileNo });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "mobileNo already exists", status: false });
    }
    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Email already exists", status: false });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      mobileNo,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      status: true,
      user: {
        username: newUser.username,
        mobileno: newUser.mobileNo,
        emial: newUser.email,
        _id: newUser._id,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// User Login Route
userRoute.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: false });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid password", status: false });
    }

    // Generate a JWT token
    const token = jwt.sign({ user: user }, process.env.secretkey, {
      // expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user: user,
      token: token,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

userRoute.patch("/api/user/status/update", authentication, async (req, res) => {
  const userId = req.user._id;
  const status = req.body.isActive;
  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { isActive: status }
    );
    if (!user) {
      res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "user updated successfully" });
  } catch (error) {
    console.log(error);
  }
});



module.exports = { userRoute };
