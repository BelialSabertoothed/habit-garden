import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Habit } from "../src/models/Habit.js";
import { HabitTick } from "../src/models/HabitTick.js";
import { ExperimentEvent } from "../src/models/ExperimentEvent.js";
import { connectDB } from "../src/db/connect.js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto"; 

// --- KONFIGURACE FILTRU ---
const EXCLUDED_EMAILS = [
  "b.simordova@gmail.com", 
  "testgamified@user.app",
];

// Funkce pro anonymizaci ID (vytvoří krátký hash)
function anonymizeId(realId: string): string {
  return crypto.createHash('sha256').update(realId).digest('hex').substring(0, 8);
}

function toTs(value: any) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

async function main() {
  console.log("[exportAnalytics] Connecting…");
  await connectDB();
  console.log("[exportAnalytics] Connected");

  const users = (await User.find({
    email: { $nin: EXCLUDED_EMAILS }
  }).lean()) as any[];
  
  console.log(`[exportAnalytics] Found ${users.length} potential users`);

  const rows = [];
  let skippedInactive = 0;

  for (const u of users) {
    const userId = (u._id as any).toString();
    const ticks = await HabitTick.find({ userId }).lean();

    // Filtr neaktivních (stejný jako minule)
    const hasXP = (u.xp || 0) > 0;
    const hasActivity = ticks.length > 0;

    if (!hasXP && !hasActivity) {
      skippedInactive++;
      continue; 
    }

    // --- ANONYMIZACE ---
    // Vytvoříme anonymní ID pro export
    const anonId = anonymizeId(userId);

    const habits = await Habit.find({
      userId,
      active: { $ne: false },
    }).lean();

    let events = [];
    try {
      events = await ExperimentEvent.find({ userId }).sort({ createdAt: 1 }).lean();
    } catch (err) {
      console.warn(`Error events ${userId}`, err);
    }

    let variantSwitchCount = 0;
    let variantFirstSwitchTs: number | null = null;
    let initialVariant = u.experimentVariant; 

    for (const ev of events) {
      if (ev.type === "variant_switch") {
        variantSwitchCount++;
        if (variantSwitchCount === 1) {
          variantFirstSwitchTs = toTs(ev.createdAt);
          if (ev.payload && ev.payload.from) {
            initialVariant = ev.payload.from; 
          }
        }
      }
    }

    let ticksPre = 0;
    let ticksPost = 0;
    const daysPre = new Set<string>();
    const daysPost = new Set<string>();
    const uniqueDaysTotal = new Set<string>();
    let firstTickTs: number | null = null;
    let lastTickTs: number | null = null;

    for (const t of ticks) {
      const ts = toTs(t.createdAt || t.dayKey);
      const dayKeyStr = String(t.dayKey);

      uniqueDaysTotal.add(dayKeyStr);
      if (ts !== null) {
        if (firstTickTs === null || ts < firstTickTs) firstTickTs = ts;
        if (lastTickTs === null || ts > lastTickTs) lastTickTs = ts;

        if (variantFirstSwitchTs && ts >= variantFirstSwitchTs) {
          ticksPost++;
          if (t.dayKey) daysPost.add(dayKeyStr);
        } else {
          ticksPre++;
          if (t.dayKey) daysPre.add(dayKeyStr);
        }
      }
    }

    const daysActiveTotal = uniqueDaysTotal.size;
    const engagementPre = daysPre.size > 0 ? (ticksPre / daysPre.size).toFixed(2) : "0";
    const engagementPost = daysPost.size > 0 ? (ticksPost / daysPost.size).toFixed(2) : "0";

    const createdTs = toTs(u.createdAt);
    
    // Sestavení řádku - BEZ EMAILU a s ANONYMNÍM ID
    rows.push({
      anonId, 
      // email vynechán
      createdAt: createdTs ? new Date(createdTs).toISOString() : "",
      onboardingDone: u.onboardingDone ? 1 : 0,
      notificationsEnabled: u.notificationsEnabled ? 1 : 0,
      
      totalHabits: habits.length,
      dailyHabits: habits.filter((h) => h.frequency === "Daily").length,
      weeklyHabits: habits.filter((h) => h.frequency === "Weekly").length,
      avgHabitStreak: habits.length > 0 ? (habits.reduce((sum, h) => sum + (h.streak ?? 0), 0) / habits.length).toFixed(2) : "0",
      
      initialVariant: initialVariant || "unknown",
      currentVariant: u.experimentVariant ?? "",
      hasSwitched: variantSwitchCount > 0 ? 1 : 0,
      switchCount: variantSwitchCount,
      firstSwitchDate: variantFirstSwitchTs ? new Date(variantFirstSwitchTs).toISOString() : "",
      
      totalTicks: ticks.length,
      daysActiveTotal,
      xp: u.xp ?? 0,
      level: u.level ?? 1,
      currentStreak: u.currentStreak ?? 0,
      longestStreak: u.longestStreak ?? 0,
      firstTickAt: firstTickTs ? new Date(firstTickTs).toISOString() : "",
      lastTickAt: lastTickTs ? new Date(lastTickTs).toISOString() : "",
      
      ticksPreSwitch: ticksPre,
      daysPreSwitch: daysPre.size,
      engagementPre, 
      ticksPostSwitch: ticksPost,
      daysPostSwitch: daysPost.size,
      engagementPost,
    });
  }

  console.log(`[exportAnalytics] Skipped ${skippedInactive} inactive users.`);
  
  if (!rows.length) {
    console.log("[exportAnalytics] no_data");
    await mongoose.disconnect();
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [];
  lines.push(headers.join(";"));

  for (const row of rows) {
    const line = headers.map((h) => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(";");
    lines.push(line);
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `analytics_ANONYMIZED_${dateStr}.csv`;
  const filePath = path.join(process.cwd(), fileName);

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
  console.log(`[exportAnalytics] ✅ Anonymized export saved to: ${filePath}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[exportAnalytics] ERROR", err);
  process.exit(1);
});