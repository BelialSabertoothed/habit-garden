import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Habit } from "../src/models/Habit.js";
import { HabitTick } from "../src/models/HabitTick.js";
import { ExperimentEvent } from "../src/models/ExperimentEvent.js";
import { connectDB } from "../src/db/connect.js";
import * as fs from "fs";
import * as path from "path";

// Pomocná funkce – bezpečné získání timestampu
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

  const users = (await User.find({}).lean()) as any[];
  console.log(`[exportAnalytics] Found ${users.length} users`);

  const rows = [];

  for (const u of users) {
    const userId = (u._id as any).toString();

    // --- 1. DATA O NÁVYCÍCH (Původní, důležité pro kontext) ---
    const habits = await Habit.find({
      userId,
      active: { $ne: false },
    }).lean();

    // --- 2. EXPERIMENT EVENTS (Pro určení momentu přepnutí) ---
    let events = [];
    try {
      events = await ExperimentEvent.find({ userId })
        .sort({ createdAt: 1 })
        .lean();
    } catch (err) {
      console.warn(`[exportAnalytics] Event lookup failed for ${userId}:`, err);
    }

    let variantSwitchCount = 0;
    let variantFirstSwitchTs: number | null = null;
    let initialVariant = u.experimentVariant; // Defaultně aktuální, pokud nebylo přepnuto

    for (const ev of events) {
      if (ev.type === "variant_switch") {
        variantSwitchCount++;
        // Čas PRVNÍHO přepnutí - bod zlomu pro Pre/Post analýzu
        if (variantSwitchCount === 1) {
          variantFirstSwitchTs = toTs(ev.createdAt);
          if (ev.payload && ev.payload.from) {
            initialVariant = ev.payload.from; // Původní verze před změnou
          }
        }
      }
    }

    // --- 3. ANALÝZA TICKŮ (Rozdělení na PRE a POST) ---
    const ticks = await HabitTick.find({ userId }).lean();

    let ticksPre = 0;
    let ticksPost = 0;
    const daysPre = new Set<string>();
    const daysPost = new Set<string>();

    // Původní statistiky aktivity
    const uniqueDaysTotal = new Set<string>();
    let firstTickTs: number | null = null;
    let lastTickTs: number | null = null;

    for (const t of ticks) {
      const ts = toTs(t.createdAt || t.dayKey);
      const dayKeyStr = String(t.dayKey);

      // Globální statistiky (původní)
      uniqueDaysTotal.add(dayKeyStr);
      if (ts !== null) {
        if (firstTickTs === null || ts < firstTickTs) firstTickTs = ts;
        if (lastTickTs === null || ts > lastTickTs) lastTickTs = ts;

        // Rozdělení pro výzkum (Nové)
        if (variantFirstSwitchTs && ts >= variantFirstSwitchTs) {
          // Aktivita PO přepnutí
          ticksPost++;
          if (t.dayKey) daysPost.add(dayKeyStr);
        } else {
          // Aktivita PŘED přepnutím (nebo pokud nikdy nepřepnul)
          ticksPre++;
          if (t.dayKey) daysPre.add(dayKeyStr);
        }
      }
    }

    // Výpočty angažovanosti
    const daysActiveTotal = uniqueDaysTotal.size;
    const engagementPre =
      daysPre.size > 0 ? (ticksPre / daysPre.size).toFixed(2) : "0";
    const engagementPost =
      daysPost.size > 0 ? (ticksPost / daysPost.size).toFixed(2) : "0";

    // Další původní časová data
    const createdTs = toTs(u.createdAt);
    const lastActiveTs = u.lastActiveDayKey
      ? toTs(u.lastActiveDayKey + "T00:00:00Z")
      : null;

    // --- 4. SESTAVENÍ ŘÁDKU (Vše dohromady) ---
    rows.push({
      // A) Identifikace a stav profilu (Původní)
      userId,
      email: u.email ?? "",
      createdAt: createdTs ? new Date(createdTs).toISOString() : "",
      onboardingDone: u.onboardingDone ? 1 : 0,
      notificationsEnabled: u.notificationsEnabled ? 1 : 0,

      // B) Metriky návyků (Původní - nutné pro normalizaci dat)
      totalHabits: habits.length,
      dailyHabits: habits.filter((h) => h.frequency === "Daily").length,
      weeklyHabits: habits.filter((h) => h.frequency === "Weekly").length,
      avgHabitStreak:
        habits.length > 0
          ? (
              habits.reduce((sum, h) => sum + (h.streak ?? 0), 0) /
              habits.length
            ).toFixed(2)
          : "0",

      // C) Experiment - stavy (Nové + Původní)
      initialVariant: initialVariant || "unknown", // Kde začal (control/gamified)
      currentVariant: u.experimentVariant ?? "", // Kde skončil
      hasSwitched: variantSwitchCount > 0 ? 1 : 0, // Příznak pro filtraci
      switchCount: variantSwitchCount,
      firstSwitchDate: variantFirstSwitchTs
        ? new Date(variantFirstSwitchTs).toISOString()
        : "",

      // D) Celková aktivita (Původní)
      totalTicks: ticks.length,
      daysActiveTotal,
      xp: u.xp ?? 0,
      level: u.level ?? 1,
      currentStreak: u.currentStreak ?? 0,
      longestStreak: u.longestStreak ?? 0,

      // E) Časové okno aktivity (Původní - pro retenci)
      firstTickAt: firstTickTs ? new Date(firstTickTs).toISOString() : "",
      lastTickAt: lastTickTs ? new Date(lastTickTs).toISOString() : "",
      lastActiveAt: lastActiveTs ? new Date(lastActiveTs).toISOString() : "",

      // F) VÝZKUMNÁ DATA - PRE vs POST (Nové)
      // "Kolik toho dělal před změnou?"
      ticksPreSwitch: ticksPre,
      daysPreSwitch: daysPre.size,
      engagementPre, // Průměrně splněno na aktivní den (před)

      // "Kolik toho dělal po změně?"
      ticksPostSwitch: ticksPost,
      daysPostSwitch: daysPost.size,
      engagementPost, // Průměrně splněno na aktivní den (po)
    });
  }

  if (!rows.length) {
    console.log("[exportAnalytics] no_data");
    await mongoose.disconnect();
    return;
  }

  // --- CSV Export ---
  const headers = Object.keys(rows[0]);
  const lines = [];
  lines.push(headers.join(";"));

  for (const row of rows) {
    const line = headers
      .map((h) => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(";");
    lines.push(line);
  }

  const csvContent = lines.join("\n");

  // Vygenerujeme název souboru s aktuálním datem (např. export_2023-11-14.csv)
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `analytics_export_${dateStr}.csv`;
  const filePath = path.join(process.cwd(), fileName);

  // Zápis do souboru
  fs.writeFileSync(filePath, csvContent, "utf-8");

  console.log(`[exportAnalytics] ✅ Export successfully saved to: ${filePath}`);

  await mongoose.disconnect();
  console.log("[exportAnalytics] Done");
}

main().catch((err) => {
  console.error("[exportAnalytics] ERROR", err);
  process.exit(1);
});
