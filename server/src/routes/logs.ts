import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { HabitLog } from "../models/HabitLog.js";
import { User } from "../models/User.js";
import { requireUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { calcAward, levelFromXp } from "../utils/xp.js";

const router = Router();

const LogInput = z.object({
  habitId: z.string().length(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.post(
  "/",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { habitId, date } = LogInput.parse(req.body);

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    await HabitLog.updateOne(
      { habitId, date },
      { $set: { userId, habitId, date, completed: true } },
      { upsert: true }
    );

    const xpAwarded = calcAward(habit.frequency as "daily" | "weekly");

    const d = new Date(date);
    const y = new Date(d);
    y.setDate(d.getDate() - 1);
    const yStr = y.toISOString().slice(0, 10);
    const hadYesterday = await HabitLog.exists({ userId, date: yStr });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User missing" });

    const newStreak = hadYesterday ? user.currentStreak + 1 : 1;
    const newXp = user.xp + xpAwarded;
    const newLevel = levelFromXp(newXp);
    const newLongest = Math.max(user.longestStreak, newStreak);

    await User.updateOne(
      { _id: userId },
      { $set: { xp: newXp, level: newLevel, currentStreak: newStreak, longestStreak: newLongest } }
    );

    res.json({ xpAwarded, newXp, levelUp: newLevel !== user.level, currentStreak: newStreak });
  })
);

export default router;
