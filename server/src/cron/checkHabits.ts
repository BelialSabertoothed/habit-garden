import { Habit } from "../models/Habit.js";
import { User } from "../models/User.js";
import { dayKey, weekKey } from "../lib/dateKeys.js";
import { sendDailyReminderEmail } from "../services/email.js";

export async function sendDailyNotifications() {
  console.log("[Cron] Starting daily email check...");
  

  const users = await User.find({ 
    notificationsEnabled: true,
    emailVerified: true,
    email: { $exists: true, $ne: null }
  });

  console.log(`[Cron] Found ${users.length} users with notifications enabled.`);

  const now = new Date();
  const todayK = dayKey(now);
  const thisWeekK = weekKey(now);

  let emailsSent = 0;

  for (const user of users) {
    try {
      const habits = await Habit.find({ userId: user._id, active: true });
      if (habits.length === 0) continue;

      let pendingCount = 0;

      for (const h of habits) {
        if (h.frequency === "Daily") {
          if (!h.lastCompletedAt) {
            pendingCount++;
          } else {
            const lastKey = dayKey(h.lastCompletedAt);
            if (lastKey !== todayK) pendingCount++;
          }
        } else if (h.frequency === "Weekly") {
          if (!h.lastCompletedAt) {
            pendingCount++;
          } else {
            const lastWeek = weekKey(h.lastCompletedAt);
            if (lastWeek !== thisWeekK) pendingCount++;
          }
        }
      }

      if (pendingCount === 0) continue;

      await sendDailyReminderEmail({
        to: user.email,
        nickname: user.nickname || "Gardener",
        pendingCount
      });

      emailsSent++;
      await new Promise(resolve => setTimeout(resolve, 200)); 

    } catch (err) {
      console.error(`[Cron] Failed to send email to user ${user._id}:`, err);
    }
  }

  console.log(`[Cron] Finished. Emails sent: ${emailsSent}`);
}