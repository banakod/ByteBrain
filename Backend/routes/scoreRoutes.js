const express = require("express");
const router = express.Router();
const Score = require("../models/Score");


//  SAVE / UPDATE (NO DUPLICATE EVER)
router.post("/save", async (req, res) => {
  const { username, email, score, total } = req.body;

  try {
    const updated = await Score.findOneAndUpdate(
      { email: email },
      { username: username, score: score, total: total },
      { new: true, upsert: true } // 🔥 key fix
    );

    res.json({ message: "Saved/Updated", data: updated });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error saving score" });
  }
});


// LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

module.exports = router;