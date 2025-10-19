import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import { errorHandler } from "./middleware/error.js";

import health from "./routes/health.js";
import users from "./routes/users.js";
import habits from "./routes/habits.js";
import logs from "./routes/logs.js";
import stats from "./routes/stats.js";
import rewards from "./routes/rewards.js";
import experiments from "./routes/experiments.js";

dotenv.config();
const app = express();

// CORS pro vývoj (případně uvolni/změň dle potřeby)
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"]
}));

app.use(express.json());

// Routes
app.use("/api/health", health);
app.use("/api/users", users);
app.use("/api/habits", habits);
app.use("/api/logs", logs);
app.use("/api/stats", stats);
app.use("/api/rewards", rewards);
app.use("/api/experiments", experiments);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

// Error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5050;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));
}).catch((err) => {
  console.error("❌ DB connect failed:", err);
  process.exit(1);
});
