import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

const normalizeAnswer = (value) => String(value).trim().toLowerCase();

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(10);

  const navigate = useNavigate();

  // 📥 Fetch questions
  useEffect(() => {
    axios
      .get(`${API_URL}/api/quiz`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 👉 Finish Quiz
  const finishQuiz = useCallback((finalScore = score) => {
    navigate("/result", {
      state: {
        score: finalScore,
        total: questions.length,
      },
    });
  }, [navigate, score, questions.length]);

  // 👉 Next Question
  const handleNext = useCallback((nextScore = score) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTime(10);
    } else {
      finishQuiz(nextScore);
    }
  }, [currentIndex, questions.length, finishQuiz, score]);

  // ⏱ Timer
  useEffect(() => {
    if (questions.length === 0) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev === 1) {
          handleNext();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleNext, questions.length]);

  // 👉 Answer click
  const handleAnswer = (selected) => {
    const correct = questions[currentIndex].answer;
    const isCorrect = normalizeAnswer(selected) === normalizeAnswer(correct);
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
    }

    handleNext(nextScore);
  };

  // ⏳ Loading
  if (!questions || questions.length === 0) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-[600px]">
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition duration-300">ByteBrain</h1>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">Train your brain. Upgrade your logic.</p>
        <div className="w-20 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"></div>

        <h2 className="text-lg font-bold mb-2">
          Question {currentIndex + 1} / {questions.length}
        </h2>

        <p className="mb-4 text-black-700">{q.question}</p>

        <h3 className="mb-4 text-red-500">⏱ {time}s</h3>

        <div className="grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="bg-gray-100 hover:bg-blue-500 hover:text-white p-2 rounded-lg transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
