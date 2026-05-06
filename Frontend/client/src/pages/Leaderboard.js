import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api";

function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/score/leaderboard`)
      .then(res => setScores(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-[600px]">

        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition duration-300">ByteBrain</h1>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">Train your brain. Upgrade your logic.</p>
        <div className="w-20 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"></div>

        <h2 className="text-2xl font-bold mb-6 text-center">🏆 Leaderboard</h2>

        {scores.map((s, index) => (
          <div
            key={index}
            className="flex justify-between bg-white text-black p-3 rounded-lg mb-3"
          >
            <span>#{index + 1}</span>
            <span>{s.email }</span>
            <span>{s.score}/{s.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
