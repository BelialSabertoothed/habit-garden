import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { requireUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const HabitInput = z.object({
  name: z.string().min(2).max(60),
  category: z.enum(["health","eco","productivity","relationships","custom"]).default("custom"),
  frequency: z.enum(["daily","weekly"]),
  icon: z.string().optional(),
});

router.get(
  "/",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const habits = await Habit.find({ userId, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  })
);

router.post(
  "/",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const data = HabitInput.parse(req.body);
    const created = await Habit.create({ ...data, userId });
    res.status(201).json(created);
  })
);

router.patch(
  "/:id",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const updated = await Habit.findOneAndUpdate({ _id: id, userId }, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  })
);

router.delete(
  "/:id",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const ok = await Habit.findOneAndUpdate({ _id: id, userId }, { $set: { isActive: false } }, { new: true });
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  })
);

export default router;
