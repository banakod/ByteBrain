const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  score: Number,
  total: Number,
});

module.exports = mongoose.model("Score", scoreSchema);