const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
// GET USER PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json("User not found");

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;