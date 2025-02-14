import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "/index.css";
import axios from "axios";

const SVG_WIDTH = 400;
const SVG_HEIGHT = 400;
const BORDER_MARGIN = 20;
const CIRCLE_RADIUS = 25;
const MAX_X = SVG_WIDTH - CIRCLE_RADIUS - BORDER_MARGIN;
const MAX_Y = SVG_HEIGHT - CIRCLE_RADIUS - BORDER_MARGIN;
const MIN_X = CIRCLE_RADIUS + BORDER_MARGIN;
const MIN_Y = CIRCLE_RADIUS + BORDER_MARGIN;
const INITIAL_SPEED = 1000;
const SPEED_INCREMENT = 50;
const MIN_SPEED = 200;
const SPEED_CHANGE_INTERVAL = 2;

const STAR_POSITIONS = [
    { x: 50, y: 50, delay: 0.5 },   // Top-left star
    { x: 350, y: 50, delay: 1 },    // Top-right star
    { x: 200, y: 100, delay: 1.5 }, // Center-top star
    { x: 50, y: 350, delay: 2 },    // Bottom-left star
    { x: 350, y: 350, delay: 2.5 }  // Bottom-right star
];

const App = () => {
    const [score, setScore] = useState(0);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [moves, setMoves] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const lastClickTime = useRef(0);
    const allowClick = useRef(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                await fetchLeaderboard();
            } catch (error) {
                console.error("Error loading leaderboard:", error);
            }
        };

        loadLeaderboard().catch(console.error);  // ✅ Fix: Explicitly handling the promise
    }, []);

    const moveCircle = () => {
        if (!allowClick.current) return;

        let newX = Math.random() * (MAX_X - MIN_X) + MIN_X;
        let newY = Math.random() * (MAX_Y - MIN_Y) + MIN_Y;

        setPosition({ x: newX, y: newY });

        setMoves((prevMoves) => {
            const newMoves = prevMoves + 1;
            if (newMoves % SPEED_CHANGE_INTERVAL === 0) {
                setSpeed((prevSpeed) => Math.max(prevSpeed - SPEED_INCREMENT, MIN_SPEED));
            }
            return newMoves;
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            allowClick.current = true;
            moveCircle();
        }, speed);
        return () => clearInterval(interval);
    }, [speed]);

    const handleClick = async (e) => {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastClickTime.current > 100 && allowClick.current) {
            const newScore = score + 1;
            console.log("Click registered! New score:", newScore);
            setScore((prevScore) => prevScore + 1);
            lastClickTime.current = now;
            allowClick.current = false;
            await submitScore(newScore);
            setTimeout(() => {
                allowClick.current = true;
            }, 150);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/leaderboard");
            console.log("Fetched Leaderboard:", response.data);  // ✅ Debugging step
            setLeaderboard(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            setLeaderboard([]); // Prevents UI crashes
        }
    };

    const submitScore = async (newScore) => {
        try {
            console.log("Submitting score:", newScore); // ✅ Debugging
            await axios.post("http://localhost:3000/api/submit-score", { score: newScore });
            console.log("Score submitted successfully!"); // ✅ Debugging
            await fetchLeaderboard(); // ✅ Refresh leaderboard
        } catch (error) {
            console.error("Error submitting score:", error);
        }
    };

    return (
        <div style={{textAlign: "center", marginTop: "20px"}}>
            <h2>Catch the Moving Circle! 🎯</h2>
            <p>Score: <strong>{score}</strong></p>
            <p>Speed: {speed}ms</p>

            <svg width={SVG_WIDTH} height={SVG_HEIGHT}
                 style={{border: "2px solid black", backgroundColor: "lightgray"}}>
                <defs>
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#FF5733", stopOpacity: 1}}/>
                        <stop offset="100%" style={{stopColor: "#33FF57", stopOpacity: 1}}/>
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bgGradient)"/>

                {/* Animated Border */}
                <motion.rect
                    x={BORDER_MARGIN}
                    y={BORDER_MARGIN}
                    width={SVG_WIDTH - 2 * BORDER_MARGIN}
                    height={SVG_HEIGHT - 2 * BORDER_MARGIN}
                    stroke="black"
                    strokeWidth="5"
                    fill="none"
                    animate={{strokeDasharray: [0, 1500], strokeDashoffset: [1500, 0]}}
                    transition={{duration: 2, repeat: Infinity, ease: "linear"}}
                />

                {/* Moving Circle */}
                <motion.g
                    transform={`translate(${position.x}, ${position.y})`}
                    style={{transformOrigin: "center"}}
                >
                    <motion.circle
                        cx="0"
                        cy="0"
                        r={CIRCLE_RADIUS}
                        fill="red"
                        stroke="black"
                        strokeWidth="2"
                        whileHover={{scale: 1.3}}
                        animate={{
                            fill: score % 2 === 0 ? "#FFD700" : "#FF5733",
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        onPointerDown={handleClick}
                    />
                </motion.g>

                {STAR_POSITIONS.map((star, index) => (
                    <motion.g key={index} transform={`translate(${star.x}, ${star.y})`}>
                        <motion.polygon
                            points="0,-10 6,-3 10,-3 7,3 10,10 0,5 -10,10 -7,3 -10,-3 -6,-3"
                            fill="#FFD700"
                            stroke="black"
                            strokeWidth="1"
                            animate={{opacity: [0, 1, 0], scale: [0.7, 1, 0.7]}}
                            transition={{duration: 2, repeat: Infinity, delay: star.delay}}
                        />
                    </motion.g>
                ))}
            </svg>
            <h3>🏆 Top 5 Leaderboard</h3>
            <ul>
                {leaderboard.length > 0 ? (
                    leaderboard?.map((entry, index) => (
                        <li key={index}>Score: {entry.score}</li>
                    ))
                ) : (
                    <p>No scores yet.</p>
                )}
            </ul>
        </div>
    );
};

export default App;