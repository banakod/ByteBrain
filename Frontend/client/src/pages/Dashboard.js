import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const [levelInfo, setLevelInfo] = useState({
    xp: 0,
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 100,
  });

  useEffect(() => {
    if (!email) return;

    axios
      .get(`${API_URL}/api/score/profile/${encodeURIComponent(email)}`)
      .then((res) => {
        if (res.data.levelInfo) {
          setLevelInfo(res.data.levelInfo);
        }
      })
      .catch((err) => console.log(err));
  }, [email]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            ByteBrain
          </h1>
          <p className="text-gray-300">Train your brain. Upgrade your logic.</p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition"
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl text-white mb-6">Quiz Dashboard</h2>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
            {username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm opacity-70">{email}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white/10 p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Level {levelInfo.level}</span>
            <span className="text-sm text-cyan-200">{levelInfo.xp} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${Math.min((levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP to next level
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate("/quiz")}
            className="flex-1 bg-blue-500 hover:bg-blue-600 p-3 rounded-lg text-white transition"
          >
            Take Quiz
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="flex-1 bg-green-500 hover:bg-green-600 p-3 rounded-lg text-white transition"
          >
            Leaderboard
          </button>

          <button
            onClick={() => navigate("/achievements")}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-lg text-white transition"
          >
            Achievements
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
