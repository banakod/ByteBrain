const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const quizRoutes = require("./routes/quizRoutes");


const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quizDB";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3001";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ROUTES
app.use("/api/score", scoreRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/auth", authRoutes);

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);

    if (err.message.includes("ECONNREFUSED")) {
      console.error("MongoDB is not running on localhost:27017.");
      console.error("Fix: open PowerShell as Administrator and run: net start MongoDB");
    }

    process.exit(1);
  }
}

startServer();
