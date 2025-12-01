import { Router, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { User } from "../models/User.js";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HabitTick } from "../models/HabitTick.js";
import { dayKey, prevDayKey, weekKey, prevWeekKey } from "../lib/dateKeys.js";
import { awardBadgesForUser } from "../services/rewards.js";
import { trackEvent } from "../utils/trackEvent.js";

const router = Router();

/* ---------------------------- Validace ---------------------------- */

const HabitInput = z.object({
  title: z.string().min(2).max(64),
  category: z.enum([
    "Health",
    "Eco",
    "Productivity",
    "Relationships",
    "Creativity",
    "Custom",
  ]),
  icon: z.enum(["heart", "leaf", "briefcase", "users", "palette"]),
  frequency: z.enum(["Daily", "Weekly"]),
  worth: z.number().min(1).max(100).default(10),
});

const HabitUpdateInput = z.object({
  title: z.string().min(2).max(64).optional(),
  category: z.enum([
    "Health", "Eco", "Productivity", "Relationships", "Creativity", "Custom"
  ]).optional(),
  icon: z.enum(["heart", "leaf", "briefcase", "users", "palette"]).optional(),
  frequency: z.enum(["Daily", "Weekly"]).optional(),
  active: z.boolean().optional(),
});

const BulkInput = z.object({
  habits: z.array(HabitInput).min(1).max(50),
});

/* ---------------------------- XP & level helpers ---------------------------- */

const levelMaxXp = (lvl: number) => (lvl + 1) ** 2 * 100;

const recalcLevel = (xp: number) => {
  let lvl = 1;
  while (xp >= levelMaxXp(lvl)) {
    lvl += 1;
  }
  return lvl;
};

/* ---------------------------- Bulk create ---------------------------- */

router.post(
  "/bulk",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const { habits } = BulkInput.parse(req.body);
    const userId = req.userId!;

    const docs = habits.map((h) => ({
      ...h,
      userId,
      worth: typeof h.worth === "number" ? h.worth : 10,
    }));

    const created = await Habit.insertMany(docs, { ordered: false });

    await trackEvent({
      userId,
      type: "habit_created",
      payload: { count: created.length },
    });

    res.status(201).json({
      created: created.length,
      items: created.map((d) => ({
        id: d._id,
        title: d.title,
        worth: d.worth,
      })),
    });
  })
);

/* ---------------------------- List mine (s auto-resetem streaku) ---------------------------- */

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    // 1. Načteme návyky jako Mongoose dokumenty (ne .lean(), abychom mohli volat .save())
    const habits = await Habit.find({
      userId: req.userId,
      active: { $ne: false },
    }).sort({ createdAt: 1 });

    const now = new Date();
    const yesterdayK = prevDayKey(now);
    const lastWeekK = prevWeekKey(now);
    
    const updates = [];

    // 2. Projdeme návyky a zkontrolujeme expiraci streaku
    for (const habit of habits) {
      let changed = false;
      const streak = habit.streak ?? 0;

      if (streak > 0) {
        if (habit.frequency === "Daily") {
           const lastKey = habit.lastCompletedAt ? dayKey(habit.lastCompletedAt) : null;
           // Pokud bylo naposledy PŘED včerejškem -> přerušeno (vynechal jsi včera)
           // (Pokud lastKey === yesterdayK, streak drží. Pokud lastKey < yesterdayK, je konec.)
           if (lastKey && lastKey < yesterdayK) {
             habit.streak = 0;
             changed = true;
           }
        } else if (habit.frequency === "Weekly") {
           const lastKey = habit.lastCompletedAt ? weekKey(habit.lastCompletedAt) : null;
           // Pokud bylo naposledy PŘED minulým týdnem -> přerušeno
           if (lastKey && lastKey < lastWeekK) {
             habit.streak = 0;
             changed = true;
           }
        }
      }
      
      if (changed) {
          updates.push(habit.save());
      }
    }

    // 3. Uložíme změny paralelně
    if (updates.length > 0) {
        await Promise.all(updates);
    }

    // 4. Vrátíme (případně aktualizované) návyky
    res.json({ items: habits });
  })
);

/* ---------------------------- Tick habit + XP + streak ---------------------------- */

router.post(
  "/:id/tick",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const { id } = req.params;
    const userId = req.userId!;
    const now = new Date();

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) return res.status(404).json({ error: "not found" });

    const todayKey = dayKey(now);

    // 1) Deduplikace podle lastCompletedAt
    if (habit.frequency === "Daily") {
      const lastKey = habit.lastCompletedAt
        ? dayKey(habit.lastCompletedAt)
        : undefined;
      if (lastKey === todayKey) {
        const me = await User.findById(userId).lean();
        return res.json({ ok: true, habit, me });
      }
    } else {
      // Weekly
      const thisWeek = weekKey(now);
      const lastWeek = habit.lastCompletedAt
        ? weekKey(habit.lastCompletedAt)
        : undefined;
      if (lastWeek === thisWeek) {
        const me = await User.findById(userId).lean();
        return res.json({ ok: true, habit, me });
      }
    }

    // 2) Zapiš / upsertni HabitTick (kvůli streakům)
    const thisWeekKey = weekKey(now);

    const tickDoc = {
      userId,
      habitId: habit._id,
      frequency: habit.frequency,
      dayKey: todayKey,
      weekKey: habit.frequency === "Weekly" ? thisWeekKey : todayKey,
    };

    const tickFilter =
      habit.frequency === "Weekly"
        ? { habitId: habit._id, weekKey: thisWeekKey }
        : { habitId: habit._id, dayKey: todayKey };

    let duplicateTick = false;

    try {
      await HabitTick.updateOne(
        tickFilter,
        { $setOnInsert: tickDoc },
        { upsert: true }
      );
    } catch (err: any) {
      if (err?.code === 11000) {
        duplicateTick = true;
      } else {
        throw err;
      }
    }

    if (duplicateTick) {
      const me = await User.findById(userId).lean();
      return res.json({
        ok: true,
        habit: {
          _id: habit._id,
          streak: habit.streak,
          lastCompletedAt: habit.lastCompletedAt,
        },
        me,
      });
    }

    // 3) Per-habit streak
    const prevStreak = habit.streak ?? 0;

    if (habit.frequency === "Daily") {
      const yesterdayKey = prevDayKey(now);
      const lastKey = habit.lastCompletedAt
        ? dayKey(habit.lastCompletedAt)
        : undefined;

      // Pokud bylo naposledy včera -> navazujeme
      // Pokud dnes (double check) -> navazujeme (ale to už řeší dedup výše)
      // Jinak reset na 1
      habit.streak = lastKey === yesterdayKey ? prevStreak + 1 : 1;
    } else {
      const prevWeek = prevWeekKey(now);
      const lastWeek = habit.lastCompletedAt
        ? weekKey(habit.lastCompletedAt)
        : undefined;

      habit.streak = lastWeek === prevWeek ? prevStreak + 1 : 1;
    }

    habit.lastCompletedAt = now;
    const currentStreak = habit.streak ?? 0;
    habit.bestStreak = Math.max(habit.bestStreak ?? 0, currentStreak);

    await habit.save();

    // 4) XP & level
    const me = await User.findById(userId);
    if (!me) return res.status(404).json({ error: "user missing" });

    const baseWorth = habit.worth ?? 10;
    const bonusMultiplier = Math.min(
      1.5,
      1 + 0.05 * Math.max(0, (habit.streak ?? 1) - 1)
    );
    const gainedXp = Math.round(baseWorth * bonusMultiplier);

    me.xp = (me.xp ?? 0) + gainedXp;
    me.level = recalcLevel(me.xp ?? 0);

    // 5) Globální user streak
    const yesterdayKey = prevDayKey(now);
    const lastActive = (me.lastActiveDayKey as string | undefined) || undefined;

    if (!lastActive) {
      me.currentStreak = 1;
      me.longestStreak = Math.max(me.longestStreak ?? 0, 1);
      me.lastActiveDayKey = todayKey;
    } else if (lastActive === yesterdayKey) {
      me.currentStreak = (me.currentStreak ?? 0) + 1;
      me.longestStreak = Math.max(me.longestStreak ?? 0, me.currentStreak);
      me.lastActiveDayKey = todayKey;
    } else if (lastActive === todayKey) {
      // už dnes něco dělal
    } else {
      me.currentStreak = 1;
      me.lastActiveDayKey = todayKey;
    }

    await me.save();

    // 6) 🎖 Udělení badge
    await awardBadgesForUser(me);

    await trackEvent({
      userId,
      type: "habit_completed",
      payload: {
        habitId: habit._id.toString(),
        frequency: habit.frequency,
        worth: gainedXp,
        streak: habit.streak,
      },
    });

    return res.json({
      ok: true,
      gainedXp,
      habit: {
        _id: habit._id,
        streak: habit.streak,
        bestStreak: habit.bestStreak,
        lastCompletedAt: habit.lastCompletedAt,
      },
      me: {
        xp: me.xp,
        level: me.level,
        currentStreak: me.currentStreak,
        longestStreak: me.longestStreak,
        lastActiveDayKey: me.lastActiveDayKey,
      },
    });
  })
);

/* ---------------------------- CRUD ---------------------------- */

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const habits = await Habit.find({
      userId,
      active: { $ne: false },
    }).sort({ createdAt: -1 });
    res.json(habits);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const data = HabitInput.parse(req.body);
    const created = await Habit.create({
      ...data,
      userId,
      worth: data.worth ?? 10,
    });

    await trackEvent({
      userId,
      type: "habit_created",
      payload: { count: 1 },
    });
    res.status(201).json(created);
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    
    const updateData = HabitUpdateInput.parse(req.body);

    const updated = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const ok = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: { active: false } },
      { new: true }
    );
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  })
);

export default router;