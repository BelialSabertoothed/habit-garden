import { Router, type Response } from "express";
import { z } from "zod";
import { Habit } from "../models/Habit.js";
import { User } from "../models/User.js";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HabitTick } from "../models/HabitTick.js";
import { dayKey, prevDayKey, weekKey, prevWeekKey } from "../lib/dateKeys.js";

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
  ]),
  icon: z.enum(["heart", "leaf", "briefcase", "users", "palette"]),
  frequency: z.enum(["Daily", "Weekly"]),
  worth: z.number().min(1).max(100).default(10),
});

const BulkInput = z.object({
  habits: z.array(HabitInput).min(1).max(50),
});

/* ---------------------------- XP & level helpers ---------------------------- */

const levelMaxXp = (lvl: number) => ((lvl + 1) ** 2) * 100;

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

/* ---------------------------- List mine (FE používá) ---------------------------- */

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const items = await Habit.find({
      userId: req.userId,
      active: { $ne: false },
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ items });
  })
);

/* ---------------------------- Tick habit + XP + streak ---------------------------- */

router.post("/:id/tick", requireAuth, async (req: AuthReq, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const now = new Date();

  const habit = await Habit.findOne({ _id: id, userId });
  if (!habit) return res.status(404).json({ error: "not found" });

  const dKey = dayKey(now);
  const wKey = weekKey(now);

  // 1) Už dnes/tento týden splněno? (per habit)
  const tickFilter =
    habit.frequency === "Daily"
      ? { habitId: habit._id, userId, dayKey: dKey }
      : { habitId: habit._id, userId, weekKey: wKey };

  const already = await HabitTick.findOne(tickFilter);
  if (already) {
    const me = await User.findById(userId).lean();
    return res.json({ ok: true, habit, me });
  }

  // 2) Globální info: měl user dnes nějaký tick před tímto?
  const hadTickTodayBefore = await HabitTick.exists({
    userId,
    dayKey: dKey,
  });

  // 3) Zapiš nový tick (vždy dayKey = dnešní den, weekKey jen pro Weekly)
  await HabitTick.create({
    userId,
    habitId: habit._id,
    frequency: habit.frequency,
    dayKey: dKey,
    weekKey: habit.frequency === "Weekly" ? wKey : undefined,
  });

  // 4) Per-habit streak (po dnech / týdnech)
  if (habit.frequency === "Daily") {
    const yesterdayKey = prevDayKey(now);
    const lastKey = habit.lastCompletedAt
      ? dayKey(habit.lastCompletedAt)
      : undefined;

    habit.streak = lastKey === yesterdayKey ? (habit.streak ?? 0) + 1 : 1;
  } else {
    const prevWKey = prevWeekKey(now);
    const lastW = habit.lastCompletedAt
      ? weekKey(habit.lastCompletedAt)
      : undefined;

    habit.streak = lastW === prevWKey ? (habit.streak ?? 0) + 1 : 1;
  }

  habit.lastCompletedAt = now;
  await habit.save();

  // 5) XP – základ = habit.worth, bonus podle streaku u toho habit
  const me = await User.findById(userId);
  if (!me) return res.status(404).json({ error: "user missing" });

  const baseWorth = habit.worth ?? 10;
  const streakForBonus = habit.streak ?? 1;

  // +5 % za každý den/týden streaku, maximum +50 %
  const bonusMultiplier = Math.min(
    1.5,
    1 + 0.05 * Math.max(0, streakForBonus - 1)
  );
  const gainedXp = Math.round(baseWorth * bonusMultiplier);

  const prevXp = me.xp ?? 0;
  me.xp = prevXp + gainedXp;
  me.level = recalcLevel(me.xp);

  // 6) Globální streak (user.currentStreak) – počítá se max 1× / den
  const lastKey = (me.lastActiveDayKey as string | undefined) ?? undefined;

  if (!hadTickTodayBefore) {
    const yesterday = prevDayKey(now);

    if (!lastKey) {
      me.currentStreak = 1;
      me.longestStreak = Math.max(me.longestStreak ?? 0, 1);
      me.lastActiveDayKey = dKey;
    } else if (lastKey === yesterday) {
      me.currentStreak = (me.currentStreak ?? 0) + 1;
      me.longestStreak = Math.max(me.longestStreak ?? 0, me.currentStreak);
      me.lastActiveDayKey = dKey;
    } else if (lastKey === dKey) {
      // edge case – druhý tick stejného dne, necháme streak
    } else {
      // díra v kalendáři → reset streaku
      me.currentStreak = 1;
      me.lastActiveDayKey = dKey;
    }
  } else {
    // už dnes aspoň jeden tick byl – jen refreshneme lastActiveDayKey
    me.lastActiveDayKey = dKey;
  }

  await me.save();

  // 7) Vrátíme aktuální snapshot pro FE
  res.json({
    ok: true,
    gainedXp,
    habit: {
      _id: habit._id,
      streak: habit.streak,
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
});

/* ---------------------------- CRUD (detailní) ---------------------------- */

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
    res.status(201).json(created);
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const updated = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
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
