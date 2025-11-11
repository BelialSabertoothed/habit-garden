import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();


const HabitInput = z.object({
  title: z.string().min(2).max(64),
  category: z.enum(["Health", "Eco", "Productivity", "Relationships"]),
  icon: z.enum(["heart", "leaf", "briefcase", "users"]),
  frequency: z.enum(["Daily", "Weekly"]),
});

const BulkInput = z.object({ habits: z.array(HabitInput).min(1).max(50) });

router.post("/bulk", requireAuth, async (req: AuthReq, res) => {
  const { habits } = BulkInput.parse(req.body);
  const docs = habits.map((h) => ({ ...h, userId: req.userId }));
  const created = await Habit.insertMany(docs, { ordered: false });
  res.status(201).json({ created: created.length, items: created.map((d) => d._id) });
});

router.get("/mine", requireAuth, async (req: AuthReq, res) => {
  const items = await Habit.find({ userId: req.userId, isActive: { $ne: false } })
    .sort({ createdAt: 1 })
    .lean();
  res.json({ items });
});


// POST /api/habits/:id/tick
router.post("/:id/tick", requireAuth, async (req: AuthReq, res) => {
  const { id } = req.params;
  const h = await Habit.findOne({ _id: id, userId: req.userId });
  if (!h) return res.status(404).json({ error: "not found" });

  h.streak = (h.streak ?? 0) + 1;
  h.lastCompletedAt = new Date();
  await h.save();

  res.status(204).end();
});


router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const habits = await Habit.find({ userId, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const data = HabitInput.parse(req.body);
    const created = await Habit.create({ ...data, userId });
    res.status(201).json(created);
  })
);

router.patch(
  "/:id",
  requireAuth,
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
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const ok = await Habit.findOneAndUpdate({ _id: id, userId }, { $set: { isActive: false } }, { new: true });
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  })
);

export default router;
