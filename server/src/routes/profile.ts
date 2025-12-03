import { Router, type Response } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { trackEvent } from "../utils/trackEvent.js";
import { Habit } from "../models/Habit.js";
import { HabitLog } from "../models/HabitLog.js";
import { HabitTick } from "../models/HabitTick.js";
import { Reward } from "../models/Reward.js";
import { PushSubscription } from "../models/PushSubscription.js";
import { ExperimentEvent } from "../models/ExperimentEvent.js";

const router = Router();

const InitInput = z.object({
  nickname: z.string().min(2).max(40),
  avatar: z.string().min(1), // klidně emoji/text
});

router.post("/init", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { nickname, avatar } = InitInput.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).end();

  if (!user.experimentVariant) {
    user.experimentVariant = Math.random() < 0.5 ? "gamified" : "control";
  }
  user.nickname = nickname;
  user.avatar = avatar;
  user.profileComplete = true;

  await user.save();
  return res.status(204).end();
}));

const OnboardingInput = z.object({ done: z.boolean() });

router.post("/onboarding", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { done } = OnboardingInput.parse(req.body);
  
  if (done) {
    await trackEvent({
      userId: req.userId!,
      type: "onboarding_done",
    });
  }
  
  await User.findByIdAndUpdate(req.userId, { onboardingDone: !!done });
  return res.status(204).end();
}));

router.post("/theme", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { theme } = req.body;
  if (theme !== "day" && theme !== "night") {
    return res.status(400).json({ message: "invalid theme" });
  }
  await User.findByIdAndUpdate(req.userId, { theme });
  return res.status(204).end();
}));

router.post("/xp", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { amount } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).end();

  user.xp = (user.xp || 0) + Number(amount || 0);
  const newLevel = Math.floor(user.xp / 100) + 1;
  user.level = newLevel; 

  await user.save();
  res.json({ xp: user.xp, level: user.level });
}));

const UpdateInput = z.object({
  nickname: z.string().min(2).max(40),
  avatar: z.string().min(1).max(3), 
});

router.post("/update", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { nickname, avatar } = UpdateInput.parse(req.body);
  await User.findByIdAndUpdate(req.userId, { $set: { nickname, avatar } });
  return res.status(204).end();
}));

const VariantInput = z.object({
  variant: z.enum(["gamified", "control"]),
});

router.post("/experiment", requireAuth, asyncHandler(async (req: AuthReq, res: Response) => {
  const { variant } = VariantInput.parse(req.body);
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).end();

  const prev = user.experimentVariant ?? "gamified";
  
  if (prev !== variant) {
    user.experimentVariant = variant;
    await user.save();

    await trackEvent({
      userId: user._id,
      type: "variant_switch",
      payload: {
        from: prev,
        to: variant,
      },
    });
  }

  return res.status(204).end();
}));

router.post(
  "/notifications",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const { notificationsEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { notificationsEnabled: !!notificationsEnabled } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, message: "user not found" });
    }
    
    await trackEvent({
      userId: user._id,
      type: "notifications_toggle",
      payload: {
        enabled: !!notificationsEnabled,
      },
    });

    return res.json({
      ok: true,
      notificationsEnabled: user.notificationsEnabled,
    });
  })
);

const PushSubInput = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

router.post(
  "/push-subscription",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const sub = PushSubInput.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { pushSubscription: sub } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, message: "user not found" });
    }

    return res.json({ ok: true });
  })
);

const ProfileUpdateInput = z.object({
  nickname: z.string().min(2).max(30).optional(),
  avatar: z.string().optional(),
  theme: z.enum(["day", "night"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  experimentVariant: z.enum(["gamified", "control"]).optional(),
});

router.patch(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const { nickname, avatar, theme, notificationsEnabled, experimentVariant } =
      ProfileUpdateInput.parse(req.body);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (nickname !== undefined) user.nickname = nickname;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme !== undefined) user.theme = theme;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    if (experimentVariant !== undefined) user.experimentVariant = experimentVariant;

    if (user.nickname && user.avatar && user.nickname.trim().length > 0) {
      user.profileComplete = true;
    }

    await user.save();

    res.json(user);
  })
);


router.delete(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;

    // Smazání všech souvisejících dat paralelně
    await Promise.all([
      Habit.deleteMany({ userId }),
      HabitLog.deleteMany({ userId }),
      HabitTick.deleteMany({ userId }),
      Reward.deleteMany({ userId }),
      PushSubscription.deleteMany({ userId }),
      ExperimentEvent.deleteMany({ userId }), // Volitelné, pokud chceš držet analytiku, tohle vynech
    ]);

    // Nakonec smazání uživatele
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Vymazání cookie, pokud ji používáš
    res.clearCookie("refresh_token");
    
    res.json({ ok: true, message: "Account deleted successfully" });
  })
);

export default router;