import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Reward } from "../models/Reward.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { BADGE_IDS, type BadgeId } from "../utils/badgesRules.js";
import { awardRewardIfMissing } from "../services/rewards.js";

const router = Router();

const BadgeEnum = z.enum(BADGE_IDS);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const rewards = await Reward.find({ userId }).sort({
      earnedAt: -1,
    });
    res.json(rewards);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const input = z
      .object({
        badge: BadgeEnum, // ✅ jen validní ID badge
      })
      .parse(req.body);

    const reward = await awardRewardIfMissing(userId, input.badge as BadgeId);

    res.status(201).json(reward);
  })
);

export default router;