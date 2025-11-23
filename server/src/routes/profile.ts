import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";
import { trackEvent } from "../utils/trackEvent.js";

const router = Router();

const InitInput = z.object({
  nickname: z.string().min(2).max(40),
  avatar: z.string().min(1), // klidně emoji/text
});

router.post("/init", requireAuth, async (req: AuthReq, res) => {
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
});

const OnboardingInput = z.object({ done: z.boolean() });

router.post("/onboarding", requireAuth, async (req: AuthReq, res) => {
  const { done } = OnboardingInput.parse(req.body);
  await User.findByIdAndUpdate(req.userId, { onboardingDone: !!done });

  if (done) {
    await trackEvent({
      userId: req.userId!,
      type: "onboarding_done",
    });
  }

  return res.status(204).end();
});
router.post("/theme", requireAuth, async (req: AuthReq, res) => {
  const { theme } = req.body;
  if (theme !== "day" && theme !== "night") {
    return res.status(400).json({ message: "invalid theme" });
  }
  await User.findByIdAndUpdate(req.userId, { theme });
  return res.status(204).end();
});

router.post("/xp", requireAuth, async (req: AuthReq, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).end();

  user.xp += amount;
  const newLevel = Math.floor(user.xp / 100) + 1;
  if (newLevel > user.level) user.level = newLevel;

  await user.save();
  res.json({ xp: user.xp, level: user.level });
});


const UpdateInput = z.object({
  nickname: z.string().min(2).max(40),
  avatar: z.string().min(1).max(3),
});

router.post("/update", requireAuth, async (req: AuthReq, res) => {
  const { nickname, avatar } = UpdateInput.parse(req.body);
  await User.findByIdAndUpdate(req.userId, { $set: { nickname, avatar } });
  return res.status(204).end();
});

const VariantInput = z.object({
  variant: z.enum(["gamified", "control"]),
});

router.post("/experiment", requireAuth, async (req: AuthReq, res) => {
  const { variant } = VariantInput.parse(req.body);
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).end();

  const prev = user.experimentVariant ?? "gamified";
  user.experimentVariant = variant;
  await user.save();

  // log switch
  await trackEvent({
    userId: user._id,
    type: "variant_switch",
    payload: {
      from: prev,
      to: variant,
    },
  });

  return res.status(204).end();
});

// POST /api/profile/notifications
router.post(
  "/notifications",
  requireAuth,
  async (req: AuthReq, res) => {
    try {
      const { notificationsEnabled } = req.body;

      // 💾 ULOŽÍME DO DB – pomocí findByIdAndUpdate
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: { notificationsEnabled: !!notificationsEnabled } },
        { new: true } // ← vrátí aktualizovaného usera
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
    } catch (err) {
      console.error("notifications toggle error:", err);
      return res.status(500).json({ ok: false });
    }
  }
);

const PushSubInput = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// POST /api/profile/push-subscription
router.post(
  "/push-subscription",
  requireAuth,
  async (req: AuthReq, res) => {
    try {
      const sub = PushSubInput.parse(req.body);

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: { pushSubscription: sub } },
        { new: true }
      );

      if (!user) {
        return res
          .status(404)
          .json({ ok: false, message: "user not found" });
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error("push-subscription error:", err);
      return res.status(500).json({ ok: false });
    }
  }
);

export default router;
