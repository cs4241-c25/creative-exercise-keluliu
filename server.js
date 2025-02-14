const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root route for debugging
app.get("/", (req, res) => {
    res.send("🏆 Score Server is Running!");
});

// Temporary leaderboard storage (in-memory)
let leaderboard = [];

// Get Top 5 Scores
app.get("/api/leaderboard", (req, res) => {
    console.log("📊 Sending leaderboard:", leaderboard);
    res.json(leaderboard.sort((a, b) => b.score - a.score).slice(0, 5)); // Limit to top 5
});

// Submit Score
app.post("/api/submit-score", (req, res) => {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
        return res.status(400).json({ error: "Invalid score" });
    }

    leaderboard.push({ score });

    console.log(`✅ New Score Added: ${score}`); // Log when a score is added
    console.log("📊 Updated Leaderboard:", leaderboard); // Show leaderboard in console

    res.json({ success: true, message: "Score submitted!" });
});

// Start Server
app.listen(PORT, () => {
    //leaderboard = [];
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});