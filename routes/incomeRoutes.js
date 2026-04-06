const express = require("express");
const router = express.Router();
const Income = require("../models/Income");

// ➕ Add Income
router.post("/add", async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 📊 Get Income
router.get("/:userId", async (req, res) => {
  try {
    const data = await Income.find({
      userId: req.params.userId
    });

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;