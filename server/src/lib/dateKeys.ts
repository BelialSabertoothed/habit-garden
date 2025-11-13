import { DateTime } from "luxon";

// CZ timezone (použij "Europe/Prague", nebo jinou dle potřeby)
const ZONE = "Europe/Prague";

// Vygeneruje klíč dne ve formátu "YYYY-MM-DD"
export function dayKey(date = new Date()) {
  return DateTime.fromJSDate(date, { zone: ZONE }).toFormat("yyyy-LL-dd");
}

// Vygeneruje klíč pro včerejšek
export function prevDayKey(date = new Date()) {
  return DateTime.fromJSDate(date, { zone: ZONE }).minus({ days: 1 }).toFormat("yyyy-LL-dd");
}

// Vygeneruje klíč týdne ve formátu "YYYY-Www"
export function weekKey(date = new Date()) {
  const d = DateTime.fromJSDate(date, { zone: ZONE });
  return `${d.weekYear}-W${String(d.weekNumber).padStart(2, "0")}`;
}

// Klíč pro předchozí týden
export function prevWeekKey(date = new Date()) {
  const d = DateTime.fromJSDate(date, { zone: ZONE }).minus({ weeks: 1 });
  return `${d.weekYear}-W${String(d.weekNumber).padStart(2, "0")}`;
}
