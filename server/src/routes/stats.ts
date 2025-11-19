import { Router, type Response } from "express";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HabitTick } from "../models/HabitTick.js";
import { User } from "../models/User.js";
import { dayKey } from "../lib/dateKeys.js";

const router = Router();

type WeeklyPoint = { day: string; xp: number };
type HeatmapPoint = { date: string; completed: boolean };

router.get(
  "/growth",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const now = new Date();

    const DAYS = 35;
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - (DAYS - 1)
      )
    );

    // všechny tick-y za posledních 35 dní
    const minDayKey = dayKey(start);
    const ticks = await HabitTick.find({
      userId,
      dayKey: { $gte: minDayKey },
    })
      .lean()
      .exec();

    const perDayCount: Record<string, number> = {};
    for (const t of ticks) {
      const dk = t.dayKey as string;
      perDayCount[dk] = (perDayCount[dk] ?? 0) + 1;
    }

    // Weekly XP (7 dní zpátky včetně dneška)
    const weekly: WeeklyPoint[] = [];
    let totalXpThisWeek = 0;
    let completedDaysThisWeek = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
      );
      const dk = dayKey(d);
      const count = perDayCount[dk] ?? 0;

      // jednoduchý model: 10 XP za tick (klidně změň na baseWorth apod.)
      const xp = count * 10;
      totalXpThisWeek += xp;
      if (count > 0) completedDaysThisWeek += 1;

      const label = d.toLocaleDateString("en-US", { weekday: "short" });

      weekly.push({ day: label, xp });
    }

    // Heatmap – 35 dní, od nejstaršího po dnešek
    const heatmap: HeatmapPoint[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
      );
      const dk = dayKey(d);
      const count = perDayCount[dk] ?? 0;
      heatmap.push({
        date: d.toISOString(),
        completed: count > 0,
      });
    }

    type LeanUserStats = {
      _id: unknown;
      currentStreak?: number;
      longestStreak?: number;
      xp?: number;
      lastActiveDayKey?: string;
    };

    const me = (await User.findById(userId).lean()) as LeanUserStats | null;

    res.json({
      weekly,
      heatmap,
      summary: {
        completedDaysThisWeek,
        totalXpThisWeek,
        currentStreak: me?.currentStreak ?? 0,
        totalDays: DAYS,
      },
    });
  })
);

export default router;
