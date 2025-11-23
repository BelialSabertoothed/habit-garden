import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Habit } from "../src/models/Habit.js";
import { HabitTick } from "../src/models/HabitTick.js";
import { ExperimentEvent } from "../src/models/ExperimentEvent.js";
import { connectDB } from "../src/db/connect.js";


type AnyUser = any;
type AnyHabit = any;
type AnyTick = any;
type AnyEvent = any;

// Pomocná funkce – bezpečné získání timestampu
function toTs(value: any): number | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

async function main() {
  console.log("[exportAnalytics] Connecting…");
  await connectDB();           
  console.log("[exportAnalytics] Connected");

  const users: AnyUser[] = await User.find({}).lean();
  console.log(`[exportAnalytics] Found ${users.length} users`);

  const rows: Record<string, any>[] = [];

  for (const u of users) {
    const userId = u._id.toString();

    // --- návyky uživatele ---
    const habits: AnyHabit[] = await Habit.find({
      userId,
      active: { $ne: false },
    })
      .sort({ createdAt: 1 })
      .lean();

    // --- ticky uživatele ---
    const ticks: AnyTick[] = await HabitTick.find({ userId }).lean();

    const totalTicks = ticks.length;
    const uniqueDays = new Set<string>();
    let firstTickTs: number | null = null;
    let lastTickTs: number | null = null;

    for (const t of ticks) {
      if (t.dayKey) uniqueDays.add(String(t.dayKey));

      const ts = toTs(t.createdAt || t.dayKey);
      if (ts !== null) {
        if (firstTickTs === null || ts < firstTickTs) firstTickTs = ts;
        if (lastTickTs === null || ts > lastTickTs) lastTickTs = ts;
      }
    }

    const daysActive = uniqueDays.size;

    // --- uživatelova meta data ---
    const createdTs = toTs(u.createdAt);
    const lastActiveTs = u.lastActiveDayKey
      ? toTs(u.lastActiveDayKey + "T00:00:00Z")
      : null;

    // --- experiment eventy ---
    let variantSwitchCount = 0;
    let variantFirstSwitchTs: number | null = null;
    let notificationsToggleCount = 0;

    let events: AnyEvent[] = [];
    try {
      events = await ExperimentEvent.find({ userId })
        .sort({ createdAt: 1 })
        .lean();
    } catch (err) {
      console.warn(
        `[exportAnalytics] Event lookup failed for ${userId}:`,
        err
      );
    }

    for (const ev of events) {
      if (ev.type === "variant_switch") {
        variantSwitchCount++;
        if (variantSwitchCount === 1) {
          variantFirstSwitchTs = toTs(ev.createdAt);
        }
      }
      if (ev.type === "notifications_toggle") {
        notificationsToggleCount++;
      }
    }

    rows.push({
      // identifikace
      userId,
      email: u.email ?? "",
      createdAt: createdTs ? new Date(createdTs).toISOString() : "",
      experimentVariant: u.experimentVariant ?? "",
      notificationsEnabled: !!u.notificationsEnabled,
      profileComplete: !!u.profileComplete,
      onboardingDone: !!u.onboardingDone,

      // návyky
      totalHabits: habits.length,
      dailyHabits: habits.filter((h) => h.frequency === "Daily").length,
      weeklyHabits: habits.filter((h) => h.frequency === "Weekly").length,

      // průměrný streak napříč návyky
      avgHabitStreak:
        habits.length > 0
          ? (
              habits.reduce(
                (sum, h) => sum + (h.streak ?? 0),
                0
              ) / habits.length
            ).toFixed(2)
          : "0",

      // globální XP / streak
      xp: u.xp ?? 0,
      level: u.level ?? 1,
      currentStreak: u.currentStreak ?? 0,
      longestStreak: u.longestStreak ?? 0,

      // aktivita
      totalTicks,
      daysActive,
      firstTickAt: firstTickTs ? new Date(firstTickTs).toISOString() : "",
      lastTickAt: lastTickTs ? new Date(lastTickTs).toISOString() : "",
      lastActiveDayKey: u.lastActiveDayKey ?? "",
      lastActiveAt: lastActiveTs ? new Date(lastActiveTs).toISOString() : "",
      ticksPerActiveDay:
        daysActive > 0 ? (totalTicks / daysActive).toFixed(2) : "0",

      // experiment
      variantSwitchCount,
      variantFirstSwitchAt: variantFirstSwitchTs
        ? new Date(variantFirstSwitchTs).toISOString()
        : "",
      notificationsToggleCount,
    });
  }

  if (!rows.length) {
    console.log("[exportAnalytics] no_data");
    await mongoose.disconnect();
    return;
  }

  // --- CSV export na stdout (oddělovač ;) ---
  const headers = Object.keys(rows[0]);
  const lines: string[] = [];

  lines.push(headers.join(";"));

  for (const row of rows) {
    const line = headers
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = String(val);
        const safe = str.replace(/"/g, '""');
        return `"${safe}"`;
      })
      .join(";");
    lines.push(line);
  }

  console.log(lines.join("\n"));

  await mongoose.disconnect();
  console.log("[exportAnalytics] Done");
}

main().catch((err) => {
  console.error("[exportAnalytics] ERROR", err);
  process.exit(1);
});