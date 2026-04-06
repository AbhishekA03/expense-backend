const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    console.log("Signup request body:", req.body);

    const { username, email, password } = req.body;

    // ✅ validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: newUser,
    });

  } catch (error) {
    console.error("🔥 SIGNUP ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    res.json({ message: "Login successful", userId: user._id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
