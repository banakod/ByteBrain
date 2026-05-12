const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  category: {
    type: String,
    required: true,
    trim: true
  },
  options: [String],
  answer: String
});

module.exports = mongoose.model("Question", questionSchema);
