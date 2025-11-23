import webpush from "web-push";
import { Habit } from "../models/Habit.js";
import { PushSubscription } from "../models/PushSubscription.js";
import { User } from "../models/User.js";

export async function sendDailyNotifications() {
  const users = await User.find({ notificationsEnabled: true });

  for (const user of users) {
    const habits = await Habit.find({ userId: user._id, active: true });

    const pending = habits.some(h => {
      const last = h.lastCompletedAt ? new Date(h.lastCompletedAt) : null;
      const now = new Date();

      if (h.frequency === "Daily") {
        return !last || last.toISOString().slice(0,10) !== now.toISOString().slice(0,10);
      }

      if (h.frequency === "Weekly") {
        const lastWeek = getISOWeek(last);
        const thisWeek = getISOWeek(now);
        return lastWeek !== thisWeek;
      }

      return false;
    });

    if (!pending) continue;

    const sub = await PushSubscription.findOne({ userId: user._id });
    if (!sub) continue;

    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys
      },
      JSON.stringify({
        title: "Habit Garden 🌱",
        body: "You still have habits to water today ✨",
        data: { url: "/#garden" }
      })
    );
  }
}

function getISOWeek(date: Date | null) {
  if (!date) return -1;
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}