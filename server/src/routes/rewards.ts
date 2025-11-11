import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Reward } from "../models/Reward.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const rewards = await Reward.find({ userId }).sort({ earnedAt: -1 });
    res.json(rewards);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const input = z.object({ badge: z.string().min(2) }).parse(req.body);
    const created = await Reward.create({ userId, badge: input.badge });
    res.status(201).json(created);
  })
);

export default router;
