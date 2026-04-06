const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  source: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model("Income", incomeSchema);