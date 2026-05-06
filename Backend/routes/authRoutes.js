const express = require("express");
const router = express.Router();
const User = require("../models/user");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, msg: "User already exists" });
    }

    // create new user
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    res.json({ success: true, msg: "Signup successful" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }

    if (user.password !== password) {
      return res.json({ success: false, msg: "Wrong password" });
    }

    res.json({
      success: true,
      email: user.email,
      username: user.username,
      role: user.role,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;