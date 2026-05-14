import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

const CATEGORY_OPTIONS = ["Programming", "Web Development", "Cyber Security"];

function Admin() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState("");
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("Programming");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingGenerated, setIsSavingGenerated] = useState(false);

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
    if (!question || !category || !options || !answer) {
      alert("Fill all fields");
      return;
    }

    axios
      .post(`${API_URL}/api/quiz`, {
        question: question.trim(),
        category: category.trim(),
        options: options.split(",").map((option) => option.trim()).filter(Boolean),
        answer: answer.trim(),
      })
      .then(() => {
        setQuestion("");
        setCategory("");
        setOptions("");
        setAnswer("");
        fetchQuestions();
      })
      .catch((err) => console.log(err));
  };

  const handleGenerate = () => {
    if (!aiTopic || !aiCategory) {
      alert("Enter a topic and category");
      return;
    }

    setIsGenerating(true);
    axios
      .post(`${API_URL}/api/quiz/generate`, {
        topic: aiTopic.trim(),
        category: aiCategory,
        difficulty: aiDifficulty,
        count: Number(aiCount),
      })
      .then((res) => {
        setGeneratedQuestions(res.data.questions || []);
      })
      .catch((err) => {
        alert(err.response?.data?.msg || "Could not generate questions");
      })
      .finally(() => setIsGenerating(false));
  };

  const handleGeneratedChange = (index, field, value) => {
    setGeneratedQuestions((prev) => (
      prev.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    ));
  };

  const handleGeneratedOptionsChange = (index, value) => {
    setGeneratedQuestions((prev) => (
      prev.map((item, itemIndex) => (
        itemIndex === index
          ? { ...item, options: value.split(",").map((option) => option.trim()) }
          : item
      ))
    ));
  };

  const handleRemoveGenerated = (index) => {
    setGeneratedQuestions((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSaveGenerated = () => {
    if (generatedQuestions.length === 0) {
      alert("Generate questions first");
      return;
    }

    setIsSavingGenerated(true);
    axios
      .post(`${API_URL}/api/quiz/bulk`, { questions: generatedQuestions })
      .then(() => {
        setGeneratedQuestions([]);
        setAiTopic("");
        fetchQuestions();
      })
      .catch((err) => {
        alert(err.response?.data?.msg || "Could not save generated questions");
      })
      .finally(() => setIsSavingGenerated(false));
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

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="AI topic, e.g. JavaScript arrays"
            className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
          />

          <select
            value={aiCategory}
            onChange={(e) => setAiCategory(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-cyan-500/20 text-white outline-none border border-cyan-400/40"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>

          <select
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-cyan-500/20 text-white outline-none border border-cyan-400/40"
          >
            {["Easy", "Medium", "Hard"].map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="10"
            value={aiCount}
            onChange={(e) => setAiCount(e.target.value)}
            className="w-full lg:w-24 p-3 rounded-lg bg-white/20 text-white outline-none"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 px-5 rounded-lg text-white transition"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>

        {generatedQuestions.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-xl font-semibold text-white">Generated Questions</h3>
              <button
                onClick={handleSaveGenerated}
                disabled={isSavingGenerated}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-800 px-4 py-2 rounded-lg text-white transition"
              >
                {isSavingGenerated ? "Saving..." : "Save All"}
              </button>
            </div>

            <div className="grid gap-4">
              {generatedQuestions.map((item, index) => (
                <div
                  key={`${item.question}-${index}`}
                  className="rounded-xl border border-white/20 bg-white/10 p-4"
                >
                  <div className="grid gap-3">
                    <input
                      value={item.question}
                      onChange={(e) => handleGeneratedChange(index, "question", e.target.value)}
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <input
                      value={item.options.join(", ")}
                      onChange={(e) => handleGeneratedOptionsChange(index, e.target.value)}
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <div className="flex flex-col gap-3 md:flex-row">
                      <input
                        value={item.answer}
                        onChange={(e) => handleGeneratedChange(index, "answer", e.target.value)}
                        className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
                      />

                      <button
                        onClick={() => handleRemoveGenerated(index)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FORM */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-cyan-500/20 text-white placeholder-cyan-100 outline-none border border-cyan-400/40"
        >
          <option value="" className="text-slate-900">Select Category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option} className="text-slate-900">
              {option}
            </option>
          ))}
        </select>

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
              <span className="inline-block mb-1 rounded bg-cyan-500/20 px-2 py-1 text-xs font-semibold text-cyan-200">
                {q.category || "General"}
              </span>
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
