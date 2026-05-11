const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

const DEFAULT_CATEGORIES = ["Programming", "Web Development", "Cyber Security"];

// GET questions, optionally filtered by category
router.get("/", async (req, res) => {
  const { category } = req.query;
  const filter = category
    ? category === "General"
      ? { $or: [{ category }, { category: { $exists: false } }] }
      : { category }
    : {};
  const data = await Question.find(filter);
  res.json(data);
});

// GET all categories
router.get("/categories", async (req, res) => {
  const categories = await Question.distinct("category");
  const hasUncategorized = await Question.exists({ category: { $exists: false } });
  const categoryList = [...DEFAULT_CATEGORIES, ...categories.filter(Boolean)];

  if (hasUncategorized && !categoryList.includes("General")) {
    categoryList.push("General");
  }

  res.json([...new Set(categoryList)]);
});

const SEED_QUESTIONS = [
  {
    question: "Which keyword is used to declare a variable that can be reassigned in JavaScript?",
    category: "Programming",
    options: ["const", "let", "static", "final"],
    answer: "let",
  },
  {
    question: "What does a function return by default in JavaScript when no return statement is used?",
    category: "Programming",
    options: ["null", "0", "undefined", "false"],
    answer: "undefined",
  },
  {
    question: "Which data structure works on the LIFO principle?",
    category: "Programming",
    options: ["Queue", "Stack", "Array", "Tree"],
    answer: "Stack",
  },
  {
    question: "What is the purpose of a loop in programming?",
    category: "Programming",
    options: ["Repeat code", "Style a page", "Store images", "Encrypt passwords"],
    answer: "Repeat code",
  },
  {
    question: "Which symbol is commonly used for strict equality in JavaScript?",
    category: "Programming",
    options: ["=", "==", "===", "!="],
    answer: "===",
  },
  {
    question: "What is React?",
    category: "Web Development",
    options: ["Library", "Language", "Database", "OS"],
    answer: "Library",
  },
  {
    question: "CSS is used for?",
    category: "Web Development",
    options: ["Styling", "Logic", "Database", "Server"],
    answer: "Styling",
  },
  {
    question: "Which HTML tag is used to create a hyperlink?",
    category: "Web Development",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: "<a>",
  },
  {
    question: "Which HTTP method is commonly used to create new data?",
    category: "Web Development",
    options: ["GET", "POST", "DELETE", "PATCH"],
    answer: "POST",
  },
  {
    question: "What does API stand for?",
    category: "Web Development",
    options: [
      "Application Programming Interface",
      "Advanced Page Index",
      "Applied Program Internet",
      "Application Page Input",
    ],
    answer: "Application Programming Interface",
  },
  {
    question: "What does a firewall help protect against?",
    category: "Cyber Security",
    options: ["Unauthorized access", "Page styling", "Code formatting", "Image resizing"],
    answer: "Unauthorized access",
  },
  {
    question: "What is phishing?",
    category: "Cyber Security",
    options: ["A social engineering attack", "A CSS framework", "A database query", "A browser cache"],
    answer: "A social engineering attack",
  },
  {
    question: "Which practice makes passwords stronger?",
    category: "Cyber Security",
    options: ["Using personal names", "Reusing passwords", "Using long unique passwords", "Sharing passwords"],
    answer: "Using long unique passwords",
  },
  {
    question: "What does HTTPS add to HTTP?",
    category: "Cyber Security",
    options: ["Encryption", "More colors", "Faster images", "Extra HTML tags"],
    answer: "Encryption",
  },
  {
    question: "What is two-factor authentication used for?",
    category: "Cyber Security",
    options: [
      "Adding an extra login verification step",
      "Writing CSS faster",
      "Compressing files",
      "Creating databases",
    ],
    answer: "Adding an extra login verification step",
  },
];

// SEED sample questions
router.get("/seed", async (req, res) => {
  await Promise.all(
    SEED_QUESTIONS.map((seedQuestion) =>
      Question.findOneAndUpdate(
        { question: seedQuestion.question },
        seedQuestion,
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      )
    )
  );

  res.json({ msg: "Questions inserted", count: SEED_QUESTIONS.length });
});

// ADD question (ADMIN)
router.post("/", async (req, res) => {
  try {
    const { question, category, options, answer } = req.body;

    const newQuestion = new Question({
      question,
      category: category?.trim() || "General",
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
