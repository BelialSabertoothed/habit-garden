export async function askNotificationPermission() {
  if (typeof window === "undefined") return "unsupported" as const;

  if (!("Notification" in window)) {
    console.log("[Notif] Notifications are not supported in this browser.");
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    console.log("[Notif] Already granted.");
    return "granted" as const;
  }

  if (Notification.permission === "denied") {
    console.log("[Notif] Previously denied.");
    return "denied" as const;
  }

  const result = await Notification.requestPermission();
  console.log("[Notif] Permission result:", result);
  return result;
}