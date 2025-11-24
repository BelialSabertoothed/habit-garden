export async function askNotificationPermission() {
  if (typeof window === "undefined") return "unsupported" as const;

  if (!("Notification" in window)) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  if (Notification.permission === "denied") {
    return "denied" as const;
  }

  const result = await Notification.requestPermission();
  return result;
}