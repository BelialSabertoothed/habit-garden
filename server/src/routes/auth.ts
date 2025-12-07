import { Router, type Response } from "express";
import { z } from "zod";
import passport from "../lib/passport.js";
import { User } from "../models/User.js";
import { sendVerificationEmail } from "../services/email.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../lib/jwt.js";
import { trackEvent } from "../utils/trackEvent.js";
import { sendPasswordResetEmail } from "../services/email.js";

import crypto from "node:crypto";
import argon2 from "argon2";
import { ALLOWED_AVATARS } from "./profile.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,           
    sameSite: isProduction ? "none" : "lax", 
    secure: isProduction,     
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie("refresh_token", { 
    path: "/api/auth/refresh",
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction
  });
}

/* ---------- Email + heslo registrace + verifikace ---------- */

const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nickname: z.string().min(2).max(40).optional(),
  avatar: z.enum(ALLOWED_AVATARS).optional(),
});

type Variant = "gamified" | "control";
const pickVariant = (): Variant =>
  Math.random() < 0.5 ? "gamified" : "control";

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, nickname, avatar } = RegisterInput.parse(req.body);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "email already used" });
    }

    const passwordHash = await hashPassword(password);

    // 🔑 verifikační token + expirace 24h
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      provider: "local",
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpiresAt,
      nickname: nickname ?? null,
      avatar: avatar ?? null,
      profileComplete: false,
      lastLoginAt: null,
      experimentVariant: pickVariant(),
      notificationsEnabled: false,
    });

    // ✉️ Pošli verifikační email
    await sendVerificationEmail({
      to: user.email,
      token: emailVerificationToken,
    });

    return res.status(201).json({
      ok: true,
      message: "Account created. Please check your email to verify.",
    });
  })
);

/* ---------- Email verifikace ---------- */

router.get(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (!token || typeof token !== "string") {
      return res.status(400).send("Invalid verification link");
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send("Verification link is invalid or expired");
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
    return res.redirect(`${clientUrl}/verify-email-success`);
  })
);

/* ---------- LOGIN ---------- */

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = LoginInput.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "email_not_verified",
        message: "Please verify your email before logging in.",
      });
    }

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    user.lastLoginAt = new Date();

    await trackEvent({
      userId: user._id,
      type: "login",
    });

    // Tokeny
    const access = signAccessToken(user._id.toString());
    const refresh = signRefreshToken(user._id.toString(), crypto.randomUUID());

    user.refreshTokenHash = await hashPassword(refresh);
    await user.save();

    setRefreshCookie(res, refresh);

    return res.json({ accessToken: access });
  })
);

/* ---------- Google OAuth ---------- */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth-failed`,
  }),
  async (req, res) => {
    const id = (req.user as any).id as string;

    const access = signAccessToken(id);
    const refresh = signRefreshToken(id, crypto.randomUUID());

    const user = await User.findById(id);
    if (user) {
      user.refreshTokenHash = await hashPassword(refresh);
      user.lastLoginAt = new Date();
      await user.save();
    }

    setRefreshCookie(res, refresh);
    const redirectUrl = `${
      process.env.CLIENT_URL
    }/oauth-callback#access_token=${encodeURIComponent(access)}`;
    return res.redirect(302, redirectUrl);
  }
);

/* ---------- Refresh rotace + logout ---------- */

router.post("/refresh", async (req, res) => {
  const cookie = req.cookies?.refresh_token;
  if (!cookie) return res.status(401).json({ error: "missing refresh cookie" });

  try {
    const payload = verifyRefresh(cookie);
    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokenHash)
      return res.status(401).json({ error: "invalid refresh" });

    const valid = await argon2.verify(user.refreshTokenHash, cookie);
    if (!valid) return res.status(401).json({ error: "invalid refresh" });

    const newAccess = signAccessToken(user._id.toString());
    const newRefresh = signRefreshToken(
      user._id.toString(),
      crypto.randomUUID()
    );

    user.refreshTokenHash = await argon2.hash(newRefresh);
    await user.save();

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({ error: "invalid refresh" });
  }
});

router.post("/logout", async (req, res) => {
  const cookie = req.cookies?.refresh_token;
  if (cookie) {
    try {
      const payload = verifyRefresh(cookie);
      const user = await User.findById(payload.sub);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch {
      // Silently ignore errors during logout
    }
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
});

/* ---------- FORGOT PASSWORD ---------- */

const ForgotPasswordInput = z.object({
  email: z.string().email(),
});

router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = ForgotPasswordInput.parse(req.body);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    // Z bezpečnostních důvodů neříkáme, jestli user existuje, nebo ne
    if (!user || !user.passwordHash) {
      return res.json({ ok: true, message: "If user exists, email was sent." });
    }

    // Vygenerovat token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hodina

    user.passwordResetToken = token;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    await sendPasswordResetEmail({
      to: user.email,
      token,
    });

    res.json({ ok: true, message: "If user exists, email was sent." });
  })
);

/* ---------- RESET PASSWORD ---------- */

const ResetPasswordInput = z.object({
  token: z.string(),
  password: z.string().min(8),
});

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, password } = ResetPasswordInput.parse(req.body);

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: new Date() }, // token musí být platný
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hashnout nové heslo
    const newHash = await hashPassword(password);
    
    // Update user
    user.passwordHash = newHash;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    
    // Pro jistotu invalidujeme refresh tokeny (odhlásíme ho ze všech zařízení)
    user.refreshTokenHash = null; 

    await user.save();

    res.json({ ok: true, message: "Password updated successfully" });
  })
);

export default router;