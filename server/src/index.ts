import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import helmet from "helmet";
import { initPassport } from "./lib/passport.js";
import { connectDB } from "./db/connect.js";
import { errorHandler } from "./middleware/error.js";
import auth from "./routes/auth.js";
import habits from "./routes/habits.js";
import logs from "./routes/logs.js";
import statsRouter from "./routes/stats.js";
import rewards from "./routes/rewards.js";
import authMeRouter from "./routes/auth.me.js";
import profileRouter from "./routes/profile.js";
import pushRouter from "./routes/push.js";
import debug from "./routes/debug.js";
import rateLimit from "express-rate-limit";

connectDB();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  message: "Too many login attempts, please try again later",
});

const app = express();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],

    credentials: true,

    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],

    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tmp-oauth-session",

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,

      collectionName: "sessions",
    }) as unknown as session.Store,

    cookie: {
      secure: isProduction,

      sameSite: isProduction ? "none" : "lax",

      httpOnly: true,

      maxAge: 1000 * 60 * 15,
    },
  }),
);

const passport = initPassport();

app.use(passport.initialize());

app.use("/api/auth", auth);

app.use("/api/auth", authMeRouter);

app.use("/api/profile", profileRouter);

app.use("/api/habits", habits);

app.use("/api/logs", logs);

app.use("/api/stats", statsRouter);

app.use("/api/rewards", rewards);

app.use("/api/push", pushRouter);

app.use("/api/debug", debug);

app.use("/api/auth/login", authLimiter);

app.use("/api/auth/register", authLimiter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.use(errorHandler);

export default app;
