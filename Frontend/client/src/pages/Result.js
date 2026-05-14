import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "../api";

function Result() {
  const [saved, setSaved] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [earnedXp, setEarnedXp] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const score = location.state?.score || 0;
  const total = location.state?.total || 0;

  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!saved && email) {
      axios.post(`${API_URL}/api/score/save`, {
        email: email,
        username: username,
        score:score,
        total:total
      })
      .then((res) => {
        setAchievements(res.data.achievements || []);
        setEarnedXp(res.data.earnedXp || 0);
        setLevelInfo(res.data.levelInfo || null);
      })
      .catch((err) => console.log(err));
      setSaved(true);
    }
  }, [saved, email, username, score, total]);

  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-[600px]">
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition duration-300">ByteBrain</h1>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">Train your brain. Upgrade your logic.</p>
        <div className="w-20 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"></div>

        <h2 className="text-2xl font-bold mb-4">🎉 Result</h2>

        <p className="text-lg mb-2">
          Score: <span className="font-semibold">{score} / {total}</span>
        </p>

        <p className="mb-4">
          {score === total
            ? "🔥 Perfect!"
            : score >= total / 2
            ? "👍 Good Job!"
            : "😢 Try Again!"}
        </p>

        {levelInfo && (
          <div className="mb-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-4 text-white">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">+{earnedXp} XP earned</span>
              <span className="text-sm text-yellow-200">Level {levelInfo.level}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-yellow-400"
                style={{ width: `${Math.min((levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              Total XP: {levelInfo.xp}
            </p>
          </div>
        )}

        {unlockedAchievements.length > 0 && (
          <div className="mb-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4">
            <h3 className="mb-3 text-lg font-semibold text-cyan-100">
              Achievements unlocked
            </h3>
            <div className="grid gap-2">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-lg bg-white/10 p-3 text-white"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold">
                    {achievement.badge}
                  </span>
                  <div>
                    <p className="font-semibold">{achievement.title}</p>
                    <p className="text-sm text-gray-300">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg mb-3 hover:bg-blue-600"
        >
          Go Dashboard
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          View Leaderboard
        </button>

        <button
          onClick={() => navigate("/achievements")}
          className="mt-3 w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600"
        >
          View Achievements
        </button>
      </div>
    </div>
  );
}

export default Result;
