const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

const XP_PER_CORRECT_ANSWER = 10;
const XP_PER_COMPLETED_QUIZ = 20;
const XP_PER_PERFECT_QUIZ = 50;
const XP_PER_LEVEL = 100;

const getLevelInfo = (xp = 0) => {
  const safeXp = Math.max(Number(xp) || 0, 0);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = safeXp % XP_PER_LEVEL;

  return {
    xp: safeXp,
    level,
    currentLevelXp,
    nextLevelXp: XP_PER_LEVEL,
    progress: currentLevelXp,
  };
};

const getEarnedXp = (score = 0, total = 0) => {
  const safeScore = Math.max(Number(score) || 0, 0);
  const safeTotal = Math.max(Number(total) || 0, 0);

  if (safeScore === 0) {
    return 0;
  }

  const perfectBonus = safeTotal > 0 && safeScore === safeTotal ? XP_PER_PERFECT_QUIZ : 0;

  return (safeScore * XP_PER_CORRECT_ANSWER) + XP_PER_COMPLETED_QUIZ + perfectBonus;
};

const getAchievementList = ({ score = 0, total = 0, rank = null, xp = 0 }) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  return [
    {
      id: "first_quiz",
      title: "First Quiz",
      description: "Complete your first quiz.",
      unlocked: total > 0,
      badge: "XP",
    },
    {
      id: "half_way",
      title: "Half Way Hero",
      description: "Score at least 50% in a quiz.",
      unlocked: total > 0 && percent >= 50,
      badge: "50",
    },
    {
      id: "high_scorer",
      title: "High Scorer",
      description: "Score at least 80% in a quiz.",
      unlocked: total > 0 && percent >= 80,
      badge: "80",
    },
    {
      id: "perfect_score",
      title: "Perfect Score",
      description: "Answer every question correctly.",
      unlocked: total > 0 && score === total,
      badge: "100",
    },
    {
      id: "top_three",
      title: "Top 3 Rank",
      description: "Reach the top 3 on the leaderboard.",
      unlocked: rank !== null && rank <= 3,
      badge: "TOP",
    },
    {
      id: "level_five",
      title: "Level 5 Learner",
      description: "Reach level 5 with XP points.",
      unlocked: getLevelInfo(xp).level >= 5,
      badge: "L5",
    },
  ];
};

const getAchievementSummary = async (email) => {
  const score = await Score.findOne({ email });

  if (!score) {
    const achievements = getAchievementList({});
    const levelInfo = getLevelInfo(0);
    return {
      score: null,
      rank: null,
      levelInfo,
      unlockedCount: 0,
      totalCount: achievements.length,
      achievements,
    };
  }

  const scores = await Score.find().sort({ score: -1, updatedAt: 1 });
  const rankIndex = scores.findIndex((item) => item.email === email);
  const rank = rankIndex === -1 ? null : rankIndex + 1;
  const achievements = getAchievementList({
    score: score.score,
    total: score.total,
    rank,
    xp: score.xp,
  });
  const levelInfo = getLevelInfo(score.xp);

  return {
    score,
    rank,
    levelInfo,
    unlockedCount: achievements.filter((achievement) => achievement.unlocked).length,
    totalCount: achievements.length,
    achievements,
  };
};


//  SAVE / UPDATE (NO DUPLICATE EVER)
router.post("/save", async (req, res) => {
  const { username, email, score, total } = req.body;

  try {
    const existingScore = await Score.findOne({ email });
    const earnedXp = getEarnedXp(score, total);
    const nextXp = (existingScore?.xp || 0) + earnedXp;
    const levelInfo = getLevelInfo(nextXp);

    const updated = await Score.findOneAndUpdate(
      { email: email },
      {
        username: username,
        score: score,
        total: total,
        xp: nextXp,
        level: levelInfo.level,
      },
      { new: true, upsert: true } // 🔥 key fix
    );

    const achievementSummary = await getAchievementSummary(email);

    res.json({
      message: "Saved/Updated",
      data: updated,
      achievements: achievementSummary.achievements,
      unlockedCount: achievementSummary.unlockedCount,
      totalCount: achievementSummary.totalCount,
      rank: achievementSummary.rank,
      earnedXp,
      levelInfo: achievementSummary.levelInfo,
    });

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

// PROFILE XP / LEVEL
router.get("/profile/:email", async (req, res) => {
  try {
    const summary = await getAchievementSummary(req.params.email);
    res.json({
      score: summary.score,
      rank: summary.rank,
      levelInfo: summary.levelInfo,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// ACHIEVEMENTS
router.get("/achievements/:email", async (req, res) => {
  try {
    const summary = await getAchievementSummary(req.params.email);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Error fetching achievements" });
  }
});

module.exports = router;
