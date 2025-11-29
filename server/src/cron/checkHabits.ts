import webpush from "web-push";
import { Habit } from "../models/Habit.js";
import { PushSubscription } from "../models/PushSubscription.js";
import { User } from "../models/User.js";
import { dayKey, weekKey } from "../lib/dateKeys.js"; 

export async function sendDailyNotifications() {
  const users = await User.find({ notificationsEnabled: true });

  const now = new Date();
  const todayK = dayKey(now);
  const thisWeekK = weekKey(now);

  for (const user of users) {
    const habits = await Habit.find({ userId: user._id, active: true });

    const pending = habits.some((h) => {
      if (h.frequency === "Daily") {
        if (!h.lastCompletedAt) return true;
        const lastKey = dayKey(h.lastCompletedAt);
        return lastKey !== todayK;
      }

      if (h.frequency === "Weekly") {
        if (!h.lastCompletedAt) return true;
        const lastWeek = weekKey(h.lastCompletedAt);
        return lastWeek !== thisWeekK;
      }

      return false;
    });

    if (!pending) continue;

    const subs = await PushSubscription.find({ userId: user._id });

    if (subs.length === 0) continue;

    const notifications = subs.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify({
            title: "Habit Garden 🌱",
            body: "You still have habits to water today ✨",
            data: { url: "/#garden" },
          })
        )
        .catch((err) => {

          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`[Cron] Cleaning up expired subscription for user ${user._id}`);
            PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
          } else {
            console.error(`[Cron] Push failed for user ${user._id}:`, err);
          }
        })
    );

    await Promise.all(notifications);
  }
}