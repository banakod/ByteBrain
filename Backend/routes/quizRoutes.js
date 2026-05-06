const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// GET all questions
router.get("/", async (req, res) => {
  const data = await Question.find();
  res.json(data);
});

// SEED sample questions
router.get("/seed", async (req, res) => {
  await Question.insertMany([
    {
      question: "What is React?",
      options: ["Library", "Language", "Database", "OS"],
      answer: "Library",
    },
    {
      question: "What is JavaScript?",
      options: ["Language", "Database", "OS", "Browser"],
      answer: "Language",
    },
    {
      question: "CSS is used for?",
      options: ["Styling", "Logic", "Database", "Server"],
      answer: "Styling",
    },
  ]);

  res.send("Data Inserted"); // 
});

// ADD question (ADMIN)
router.post("/", async (req, res) => {
  try {
    const { question, options, answer } = req.body;

    const newQuestion = new Question({
      question,
      options,
      answer,
    });

    await newQuestion.save();

    res.json({ msg: "Question added successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error adding question" });
  }
    
});

 // DELETE question (ADMIN)
    router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ msg: "Question deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting question" });
  }
});


module.exports = router;