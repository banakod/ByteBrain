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

// DB CONNECT
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
