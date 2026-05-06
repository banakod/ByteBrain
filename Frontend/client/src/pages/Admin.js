import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Admin() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // or "user"
    navigate("/login");
  };

  // 📥 Fetch questions
  const fetchQuestions = () => {
    axios
      .get(`${API_URL}/api/quiz`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ➕ Add Question
  const handleAdd = () => {
    if (!question || !options || !answer) {
      alert("Fill all fields");
      return;
    }

    axios
      .post(`${API_URL}/api/quiz`, {
        question: question.trim(),
        options: options.split(",").map((option) => option.trim()).filter(Boolean),
        answer: answer.trim(),
      })
      .then(() => {
        setQuestion("");
        setOptions("");
        setAnswer("");
        fetchQuestions();
      })
      .catch((err) => console.log(err));
  };

  // ❌ Delete Question
  const handleDelete = (id) => {
    axios
      .delete(`${API_URL}/api/quiz/${id}`)
      .then(() => fetchQuestions())
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-10">

      {/* 🔥 HEADER WITH LOGOUT */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            ByteBrain
          </h1>
          <p className="text-gray-300">
            Train your brain. Upgrade your logic.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition"
        >
          Logout
        </button>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl text-white mb-6">Admin Panel</h2>

      {/* FORM */}
      <div className="flex gap-4 mb-6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
        />

        <input
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder="Options (comma separated)"
          className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
        />

        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
        />

        <button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 px-5 rounded-lg text-white transition"
        >
          Add
        </button>
      </div>

      {/* QUESTION LIST */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">

        {questions.map((q) => (
          <div
            key={q._id}
            className="flex justify-between items-center border-b border-white/20 py-3 hover:bg-white/10 transition"
          >
            <div className="flex-1">
              <p className="text-white font-semibold">{q.question}</p>
              <p className="text-gray-300 text-sm">
                {q.options.join(", ")}
              </p>
            </div>

            <button
              onClick={() => handleDelete(q._id)}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
            >
              Delete
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Admin;
