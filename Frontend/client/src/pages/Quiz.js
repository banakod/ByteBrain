import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

const normalizeAnswer = (value) => String(value).trim().toLowerCase();

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/quiz/categories`)
      .then((res) => {
        setCategories(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    setIsLoading(true);
    axios
      .get(`${API_URL}/api/quiz`, { params: { category: selectedCategory } })
      .then((res) => {
        setQuestions(res.data);
        setCurrentIndex(0);
        setScore(0);
        setTime(10);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [selectedCategory]);

  const finishQuiz = useCallback((finalScore = score) => {
    navigate("/result", {
      state: {
        score: finalScore,
        total: questions.length,
      },
    });
  }, [navigate, score, questions.length]);

  const handleNext = useCallback((nextScore = score) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTime(10);
    } else {
      finishQuiz(nextScore);
    }
  }, [currentIndex, questions.length, finishQuiz, score]);

  useEffect(() => {
    if (!selectedCategory || questions.length === 0) return;

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
  }, [handleNext, questions.length, selectedCategory]);

  const handleAnswer = (selected) => {
    const correct = questions[currentIndex].answer;
    const isCorrect = normalizeAnswer(selected) === normalizeAnswer(correct);
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
    }

    handleNext(nextScore);
  };

  if (isLoading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
            ByteBrain
          </h1>
          <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">
            Choose a category to start your quiz.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="rounded-lg border border-cyan-400/40 bg-cyan-500/20 p-4 text-white transition hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                {category}
              </button>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-gray-300">
              No categories found. Add questions from the admin panel first.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <h2 style={{ textAlign: "center" }}>No questions found.</h2>;
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-[600px]">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition duration-300">
          ByteBrain
        </h1>
        <p className="text-center text-gray-300 text-sm md:text-base mb-6 italic tracking-wide">
          Train your brain. Upgrade your logic.
        </p>
        <div className="w-20 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"></div>

        <h2 className="text-lg font-bold mb-2">
          Question {currentIndex + 1} / {questions.length}
        </h2>

        <p className="mb-3 inline-block rounded bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-100 border border-cyan-400/40">
          Category: {selectedCategory}
        </p>

        <p className="mb-4 text-black-700">{q.question}</p>

        <h3 className="mb-4 text-red-500">Timer: {time}s</h3>

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
