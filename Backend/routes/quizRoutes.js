const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

const DEFAULT_CATEGORIES = ["Programming", "Web Development", "Cyber Security"];

// GET questions, optionally filtered by category
router.get("/", async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const data = await Question.find(filter);
  res.json(data);
});

// GET all categories
router.get("/categories", async (req, res) => {
  const categories = await Question.distinct("category");
  const categoryList = [
    ...DEFAULT_CATEGORIES,
    ...categories.filter((category) => DEFAULT_CATEGORIES.includes(category)),
  ];

  res.json([...new Set(categoryList)]);
});

const SEED_QUESTIONS = [
  {
    question: "What is JavaScript?",
    category: "Programming",
    options: ["Programming language", "Database", "Operating system", "Image editor"],
    answer: "Programming language",
  },
  {
    question: "Which symbol is used for addition?",
    category: "Programming",
    options: ["+", "-", "*", "/"],
    answer: "+",
  },
  {
    question: "What is a variable used for?",
    category: "Programming",
    options: ["Storing data", "Painting screens", "Charging a laptop", "Opening a door"],
    answer: "Storing data",
  },
  {
    question: "Which value means true or false?",
    category: "Programming",
    options: ["Boolean", "Image", "Folder", "Button"],
    answer: "Boolean",
  },
  {
    question: "What does a loop do?",
    category: "Programming",
    options: ["Repeats code", "Deletes files", "Changes monitor color", "Turns off Wi-Fi"],
    answer: "Repeats code",
  },
  {
    question: "What does HTML create?",
    category: "Web Development",
    options: ["Page structure", "Computer virus", "Laptop battery", "Internet bill"],
    answer: "Page structure",
  },
  {
    question: "What does CSS change?",
    category: "Web Development",
    options: ["Page style", "Mouse speed", "Phone volume", "Keyboard language"],
    answer: "Page style",
  },
  {
    question: "Which tag is used for a paragraph in HTML?",
    category: "Web Development",
    options: ["<p>", "<img>", "<button>", "<table>"],
    answer: "<p>",
  },
  {
    question: "Which tag is used to show an image?",
    category: "Web Development",
    options: ["<img>", "<p>", "<h1>", "<div>"],
    answer: "<img>",
  },
  {
    question: "What is a website opened in?",
    category: "Web Development",
    options: ["Browser", "Calculator", "Camera", "Notepad only"],
    answer: "Browser",
  },
  {
    question: "What should you keep secret?",
    category: "Cyber Security",
    options: ["Password", "Favorite color", "Weather", "Screen size"],
    answer: "Password",
  },
  {
    question: "What is a strong password?",
    category: "Cyber Security",
    options: ["Long and unique", "Only your name", "12345", "password"],
    answer: "Long and unique",
  },
  {
    question: "What should you do before clicking a strange link?",
    category: "Cyber Security",
    options: ["Check if it is safe", "Click quickly", "Share it with everyone", "Ignore the sender"],
    answer: "Check if it is safe",
  },
  {
    question: "What does antivirus software help find?",
    category: "Cyber Security",
    options: ["Malware", "Wall color", "Printer paper", "Music volume"],
    answer: "Malware",
  },
  {
    question: "What should you do on a shared computer after using an account?",
    category: "Cyber Security",
    options: ["Log out", "Save password", "Leave it open", "Turn brightness up"],
    answer: "Log out",
  },
];

// SEED sample questions
router.get("/seed", async (req, res) => {
  await Question.deleteMany({ category: { $in: DEFAULT_CATEGORIES } });
  await Question.insertMany(SEED_QUESTIONS);

  res.json({ msg: "Questions inserted", count: SEED_QUESTIONS.length });
});

// ADD question (ADMIN)
router.post("/", async (req, res) => {
  try {
    const { question, category, options, answer } = req.body;

    if (!question || !category || !options || !answer) {
      return res.status(400).json({ msg: "Question, category, options, and answer are required" });
    }

    if (!DEFAULT_CATEGORIES.includes(category.trim())) {
      return res.status(400).json({ msg: "Invalid category" });
    }

    const newQuestion = new Question({
      question,
      category: category.trim(),
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
