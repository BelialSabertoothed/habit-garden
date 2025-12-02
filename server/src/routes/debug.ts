import { Router, type Response } from "express";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/User.js";
import { Habit } from "../models/Habit.js";
import { sendDailyReminderEmail } from "../services/email.js";
import { dayKey, weekKey } from "../lib/dateKeys.js";

const router = Router();

// GET /api/debug/test-email
// Zavoláním této adresy v prohlížeči (nebo přes Postman) se pokusíme odeslat e-mail přihlášenému uživateli
router.get(
  "/test-email",
  requireAuth,
  asyncHandler(async (req: AuthReq, res: Response) => {
    const userId = req.userId!;
    const logs: string[] = [];
    
    const log = (msg: string) => {
      console.log(`[DebugEmail] ${msg}`);
      logs.push(msg);
    };

    log(`Starting email test for user: ${userId}`);

    // 1. Kontrola proměnných prostředí
    if (!process.env.MAILTRAP_API_TOKEN) {
      log("❌ ERROR: Missing MAILTRAP_API_TOKEN in .env");
      return res.status(500).json({ ok: false, logs });
    }
    log("✅ Mailtrap token found");

    // 2. Kontrola uživatele
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    log(`User found: ${user.email}`);
    log(`- emailVerified: ${user.emailVerified}`);
    log(`- notificationsEnabled: ${user.notificationsEnabled}`);

    if (!user.emailVerified) {
      log("⚠️ WARNING: User email is NOT verified. In production, we only send to verified users.");
      // Pro test to můžeme zkusit poslat i tak, ale v cronu to neprojde
    }

    // 3. Kontrola návyků (simulace logiky z cronu)
    const habits = await Habit.find({ userId: user._id, active: true });
    log(`Found ${habits.length} active habits`);

    const now = new Date();
    const todayK = dayKey(now);
    const thisWeekK = weekKey(now);

    let pendingCount = 0;
    habits.forEach(h => {
      let isPending = false;
      if (h.frequency === "Daily") {
        const lastKey = h.lastCompletedAt ? dayKey(h.lastCompletedAt) : null;
        if (lastKey !== todayK) isPending = true;
      } else {
        const lastWeek = h.lastCompletedAt ? weekKey(h.lastCompletedAt) : null;
        if (lastWeek !== thisWeekK) isPending = true;
      }
      
      if (isPending) {
        log(`- Pending: "${h.title}" (${h.frequency})`);
        pendingCount++;
      }
    });

    log(`Total pending: ${pendingCount}`);

    if (pendingCount === 0) {
      log("⚠️ User has no pending habits. Cron would NOT send email.");
      // Pro test nastavíme pending na 1, abychom viděli, jestli e-mail dojde
      pendingCount = 1; 
      log("👉 Forcing pendingCount = 1 for this test.");
    }

    // 4. Pokus o odeslání
    try {
      log(`Attempting to send email via Mailtrap to ${user.email}...`);
      
      await sendDailyReminderEmail({
        to: user.email,
        nickname: user.nickname || "Tester",
        pendingCount
      });
      
      log("✅ SUCCESS: Email sent to Mailtrap API.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log(`❌ ERROR sending email: ${message}`);
      return res.status(500).json({ ok: false, logs, error: message });
    }

    res.json({ ok: true, logs });
  })
);

export default router;