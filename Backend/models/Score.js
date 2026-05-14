const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: String,
  score: Number,
  total: Number,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("Score", scoreSchema);
