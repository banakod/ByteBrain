const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

const DEFAULT_CATEGORIES = ["Programming", "Web Development", "Cyber Security"];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const normalizeGeneratedQuestion = (item, category) => {
  const options = Array.isArray(item.options)
    ? item.options.map((option) => String(option).trim()).filter(Boolean)
    : [];

  return {
    question: String(item.question || "").trim(),
    category,
    options: options.slice(0, 4),
    answer: String(item.answer || "").trim(),
  };
};

const parseAiQuizResponse = (text, category) => {
  const jsonText = String(text || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(jsonText);
  const list = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(list)) {
    throw new Error("AI response did not include a questions array");
  }

  const questions = list
    .map((item) => normalizeGeneratedQuestion(item, category))
    .filter((item) => (
      item.question &&
      item.options.length === 4 &&
      item.answer &&
      item.options.includes(item.answer)
    ));

  if (questions.length === 0) {
    throw new Error("AI response did not include valid quiz questions");
  }

  return questions;
};

const hasOpenAiKey = () => (
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
);

const buildLocalQuizQuestions = ({ topic, category, count, difficulty }) => {
  const templates = [
    {
      question: `What is the main purpose of ${topic}?`,
      answer: `Understanding ${topic}`,
      options: [`Understanding ${topic}`, "Changing screen brightness", "Deleting files", "Playing audio only"],
    },
    {
      question: `Which option best describes ${topic}?`,
      answer: "A learning concept",
      options: ["A learning concept", "A random password", "A computer cable", "A printer setting"],
    },
    {
      question: `Why is ${topic} important in ${category}?`,
      answer: "It helps build stronger knowledge",
      options: ["It helps build stronger knowledge", "It makes the monitor bigger", "It removes all questions", "It disables the keyboard"],
    },
    {
      question: `What should you do first when learning ${topic}?`,
      answer: "Understand the basics",
      options: ["Understand the basics", "Skip every example", "Ignore definitions", "Guess without reading"],
    },
    {
      question: `Which difficulty level was selected for this ${topic} quiz?`,
      answer: difficulty,
      options: [difficulty, "Unknown", "No level", "Practice only"],
    },
    {
      question: `What is a good way to improve at ${topic}?`,
      answer: "Practice with questions",
      options: ["Practice with questions", "Avoid examples", "Close the app", "Memorize random words"],
    },
    {
      question: `Which category does this quiz belong to?`,
      answer: category,
      options: [category, "Cooking", "Travel", "Music"],
    },
    {
      question: `What does a quiz on ${topic} help test?`,
      answer: "Knowledge and understanding",
      options: ["Knowledge and understanding", "Laptop battery health", "Internet speed only", "Mouse color"],
    },
    {
      question: `What should each question about ${topic} have?`,
      answer: "One correct answer",
      options: ["One correct answer", "No options", "Only images", "No question text"],
    },
    {
      question: `What is the best habit while answering ${topic} questions?`,
      answer: "Read carefully before choosing",
      options: ["Read carefully before choosing", "Click without reading", "Always choose the first option", "Skip all questions"],
    },
  ];

  return templates.slice(0, count).map((item) => ({
    ...item,
    category,
  }));
};

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

// GENERATE questions with AI (ADMIN)
router.post("/generate", async (req, res) => {
  try {
    const { topic, category, count = 5, difficulty = "Medium" } = req.body;
    const cleanTopic = String(topic || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanDifficulty = String(difficulty || "Medium").trim();
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 10);

    if (!cleanTopic || !cleanCategory) {
      return res.status(400).json({ msg: "Topic and category are required" });
    }

    if (!DEFAULT_CATEGORIES.includes(cleanCategory)) {
      return res.status(400).json({ msg: "Invalid category" });
    }

    if (!DIFFICULTY_OPTIONS.includes(cleanDifficulty)) {
      return res.status(400).json({ msg: "Invalid difficulty" });
    }

    if (!hasOpenAiKey()) {
      return res.json({
        questions: buildLocalQuizQuestions({
          topic: cleanTopic,
          category: cleanCategory,
          count: safeCount,
          difficulty: cleanDifficulty,
        }),
        source: "local",
        msg: "Generated locally because OPENAI_API_KEY is not configured.",
      });
    }

    const prompt = [
      `Create ${safeCount} ${cleanDifficulty.toLowerCase()} multiple-choice quiz questions.`,
      `Topic: ${cleanTopic}`,
      `Category: ${cleanCategory}`,
      "Return only valid JSON in this exact shape:",
      '{"questions":[{"question":"...","options":["...","...","...","..."],"answer":"..."}]}',
      "Each question must have exactly 4 options. The answer must exactly match one option.",
      "Keep questions short, clear, and suitable for students.",
    ].join("\n");

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        instructions: "You generate quiz data and return only valid JSON.",
        input: prompt,
        max_output_tokens: 2500,
      }),
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({
        msg: data.error?.message || "Error generating questions",
      });
    }

    const text = data.output_text || data.output?.[0]?.content?.[0]?.text;
    const questions = parseAiQuizResponse(text, cleanCategory);

    res.json({ questions });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message || "Error generating questions" });
  }
});

// SAVE generated questions (ADMIN)
router.post("/bulk", async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: "Questions are required" });
    }

    const cleanedQuestions = questions.map((item) => {
      const category = String(item.category || "").trim();
      return normalizeGeneratedQuestion(item, category);
    });

    const invalidQuestion = cleanedQuestions.find((item) => (
      !item.question ||
      !DEFAULT_CATEGORIES.includes(item.category) ||
      item.options.length !== 4 ||
      !item.answer ||
      !item.options.includes(item.answer)
    ));

    if (invalidQuestion) {
      return res.status(400).json({ msg: "Generated questions are not valid" });
    }

    await Question.insertMany(cleanedQuestions);

    res.json({
      msg: "Generated questions added successfully",
      count: cleanedQuestions.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error saving generated questions" });
  }
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
