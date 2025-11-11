import { Router } from "express";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

const router = Router();

  router.get("/me", requireAuth, async (req: AuthReq, res) => {
  const user = await User.findById(req.userId).lean() as any;
  if (!user) return res.status(401).json({ message: "not found" });

  res.json({
    id: user._id.toString(),
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    theme: user.theme,
    profileComplete: user.profileComplete,
    onboardingDone: user.onboardingDone,
    experimentVariant: user.experimentVariant,
  });
});

export default router;
