import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Achievements() {
  const [summary, setSummary] = useState({
    achievements: [],
    unlockedCount: 0,
    totalCount: 0,
    rank: null,
    levelInfo: {
      xp: 0,
      level: 1,
      currentLevelXp: 0,
      nextLevelXp: 100,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/score/achievements/${encodeURIComponent(email)}`)
      .then((res) => {
        setSummary(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [email, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
        Loading achievements...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              Achievements
            </h1>
            <p className="mt-2 text-gray-300">
              {summary.unlockedCount} of {summary.totalCount} unlocked
              {summary.rank ? ` | Leaderboard rank #${summary.rank}` : ""}
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-blue-500 px-5 py-3 text-white transition hover:bg-blue-600"
          >
            Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-5 text-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-semibold">Level {summary.levelInfo?.level || 1}</span>
            <span className="text-sm text-yellow-200">{summary.levelInfo?.xp || 0} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-yellow-400"
              style={{
                width: `${Math.min(((summary.levelInfo?.currentLevelXp || 0) / (summary.levelInfo?.nextLevelXp || 100)) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {summary.levelInfo?.currentLevelXp || 0} / {summary.levelInfo?.nextLevelXp || 100} XP to next level
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {summary.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border p-5 shadow-xl ${
                achievement.unlocked
                  ? "border-cyan-400/50 bg-white/10"
                  : "border-white/10 bg-white/5 opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    achievement.unlocked
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {achievement.badge}
                </span>

                <div>
                  <p className="text-lg font-semibold text-white">
                    {achievement.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {achievement.description}
                  </p>
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      achievement.unlocked ? "text-cyan-200" : "text-gray-400"
                    }`}
                  >
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {summary.achievements.length === 0 && (
          <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center text-gray-300">
            Complete a quiz to start earning achievements.
          </div>
        )}
      </div>
    </div>
  );
}

export default Achievements;
