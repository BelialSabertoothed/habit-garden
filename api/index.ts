import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import helmet from "helmet";
import { initPassport } from "../server/src/lib/passport.js";
import { connectDB } from "../server/src/db/connect.js";
import { errorHandler } from "../server/src/middleware/error.js";
import auth from "../server/src/routes/auth.js";
import habits from "../server/src/routes/habits.js";
import logs from "../server/src/routes/logs.js";
import statsRouter from "../server/src/routes/stats.js";
import rewards from "../server/src/routes/rewards.js";
import authMeRouter from "../server/src/routes/auth.me.js";
import profileRouter from "../server/src/routes/profile.js";
import pushRouter from "../server/src/routes/push.js";
import debug from "../server/src/routes/debug.js";
import rateLimit from "express-rate-limit";
import express, { RequestHandler, ErrorRequestHandler } from "express";

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

app.use(passport.initialize() as RequestHandler);

app.use("/api/auth", auth as RequestHandler);
app.use("/api/auth", authMeRouter as RequestHandler);
app.use("/api/profile", profileRouter as RequestHandler);
app.use("/api/habits", habits as RequestHandler);
app.use("/api/logs", logs as RequestHandler);
app.use("/api/stats", statsRouter as RequestHandler);
app.use("/api/rewards", rewards as RequestHandler);
app.use("/api/push", pushRouter as RequestHandler);
app.use("/api/debug", debug as RequestHandler);

app.use("/api/auth/login", authLimiter as RequestHandler);
app.use("/api/auth/register", authLimiter as RequestHandler);

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.use(errorHandler as ErrorRequestHandler);

export default app;
