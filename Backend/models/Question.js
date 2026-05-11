const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  category: {
    type: String,
    default: "General",
    trim: true
  },
  options: [String],
  answer: String
});

module.exports = mongoose.model("Question", questionSchema);
