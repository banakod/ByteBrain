import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "../api";

function Result() {
  const [saved, setSaved] = useState(false);
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
      });
      setSaved(true);
    }
  }, [saved, email, username, score, total]);

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
      </div>
    </div>
  );
}

export default Result;
