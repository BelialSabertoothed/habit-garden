import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import { initPassport } from "./lib/passport.js";
import { connectDB } from "./db/connect.js";
import { errorHandler } from "./middleware/error.js";
import health from "./routes/health.js";
import auth from "./routes/auth.js";
import habits from "./routes/habits.js";
import logs from "./routes/logs.js";
import stats from "./routes/stats.js";
import rewards from "./routes/rewards.js";
import experiments from "./routes/experiments.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  methods: ["GET","POST","PATCH","DELETE","OPTIONS"]
}));
app.use(express.json());
app.use(cookieParser());

// jen pro OAuth handshake (Passport vyžaduje session middleware,
// ale nepoužíváme perzistentní store, protože JWT vydáváme sami)
app.use(session({
  secret: "tmp-oauth-session", resave: false, saveUninitialized: false,
  cookie: { secure: false, sameSite: "lax" } // v prod nasadit secure: true (HTTPS)
}));
const passport = initPassport(); 
app.use(passport.initialize());

app.use("/api/health", health);
app.use("/api/auth", auth);

// chráněné trasy můžeš chránit requireJwt (až je napojíš na FE s Bearer tokenem)
// např:
// import { requireJwt } from "./middleware/requireJwt.js";
// app.use("/api/habits", requireJwt, habits);
app.use("/api/habits", habits);
app.use("/api/logs", logs);
app.use("/api/stats", stats);
app.use("/api/rewards", rewards);
app.use("/api/experiments", experiments);

app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5050;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));
});
