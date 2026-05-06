import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        username,
        email,
        password,
      });

      if (res.data.success) {
        alert("Signup successful");
        navigate("/login");
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-[600px]">

        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition duration-300">ByteBrain</h1>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">Train your brain. Upgrade your logic.</p>
        <div className="w-20 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6">Signup</h2>

        <input
          placeholder="Username"
          className="w-full p-3 mb-4 rounded-lg outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Signup
        </button>

        <p className="text-white mt-4">
          Already have account?{" "}
          <span
            className="text-yellow-300 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
