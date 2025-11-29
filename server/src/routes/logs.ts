import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { HabitLog } from "../models/HabitLog.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { calcAward, levelFromXp } from "../utils/xp.js";
import { prevDayKey } from "../lib/dateKeys.js"; 

const router = Router();

const LogInput = z.object({
  habitId: z.string().length(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { habitId, date } = LogInput.parse(req.body);

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    // 🛡️ Ošetření duplicitního zápisu (race condition / double click)
    try {
      await HabitLog.updateOne(
        { habitId, date },
        { $set: { userId, habitId, date, completed: true } },
        { upsert: true }
      );
    } catch (err: any) {
      if (err.code === 11000) {
        return res.json({ ok: true, message: "Already logged" });
      }
      throw err;
    }

    const xpAwarded = calcAward(habit.frequency as "daily" | "weekly");

  
    const dateObj = new Date(date);
    const yStr = prevDayKey(dateObj);
    
    const hadYesterday = await HabitLog.exists({ userId, date: yStr });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User missing" });

    const newStreak = hadYesterday ? (user.currentStreak || 0) + 1 : 1;
    const newXp = (user.xp || 0) + xpAwarded;
    const newLevel = levelFromXp(newXp);
    const newLongest = Math.max(user.longestStreak || 0, newStreak);

    await User.updateOne(
      { _id: userId },
      { 
        $set: { 
          xp: newXp, 
          level: newLevel, 
          currentStreak: newStreak, 
          longestStreak: newLongest 
        } 
      }
    );

    res.json({ 
      xpAwarded, 
      newXp, 
      levelUp: newLevel !== user.level, 
      currentStreak: newStreak 
    });
  })
);

export default router;