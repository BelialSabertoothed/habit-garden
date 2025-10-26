import { Router, type Response } from "express";
import { z } from "zod";
import passport from "../lib/passport.js";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../lib/jwt.js";
import crypto from "node:crypto";
import argon2 from "argon2";

const router = Router();

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
function clearRefreshCookie(res: Response) {
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
}

/* ---------- Email + heslo ---------- */

const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nickname: z.string().min(2).max(40).optional(),
});

router.post("/register", async (req, res) => {
  const { email, password, nickname } = RegisterInput.parse(req.body);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "email already used" });

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    provider: "local",
    verified: true, // v produkci bys poslala verifikační e-mail
    nickname,
    lastLoginAt: new Date(),
  });

  const access = signAccessToken(user._id.toString());
  const refresh = signRefreshToken(user._id.toString(), crypto.randomUUID());

  user.refreshTokenHash = await hashPassword(refresh);
  await user.save();

  setRefreshCookie(res, refresh);
  res.status(201).json({ accessToken: access });
});

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const { email, password } = LoginInput.parse(req.body);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) return res.status(401).json({ error: "invalid credentials" });

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  user.lastLoginAt = new Date();

  const access = signAccessToken(user._id.toString());
  const refresh = signRefreshToken(user._id.toString(), crypto.randomUUID());

  user.refreshTokenHash = await hashPassword(refresh);
  await user.save();

  setRefreshCookie(res, refresh);
  res.json({ accessToken: access });
});

/* ---------- Google OAuth ---------- */

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth-failed` }),
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
    const redirectUrl = `${process.env.CLIENT_URL}/oauth-callback#access_token=${encodeURIComponent(access)}`;
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
    if (!user || !user.refreshTokenHash) return res.status(401).json({ error: "invalid refresh" });

    const valid = await argon2.verify(user.refreshTokenHash, cookie);
    if (!valid) return res.status(401).json({ error: "invalid refresh" });

    const newAccess = signAccessToken(user._id.toString());
    const newRefresh = signRefreshToken(user._id.toString(), crypto.randomUUID());

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
    } catch {}
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export default router;
