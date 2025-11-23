import { api } from "./api";

const VAPID_PUBLIC_KEY = import.meta.env
  .VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Zapne notifikace:
 *  - ověří podporu
 *  - zajistí "granted" permission
 *  - vytvoří / obnoví push subscription
 *  - pošle subscription na BE
 *  - nastaví notificationsEnabled = true na BE
 */
export async function enableNotificationsOnClient(): Promise<boolean> {
  try {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("[notifications] Push not supported in this browser");
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error(
        "[notifications] Missing VAPID public key (VITE_VAPID_PUBLIC_KEY)"
      );
      return false;
    }

    // 1) Permission
    let permission = Notification.permission;
    if (permission === "denied") {
      console.warn("[notifications] Permission is denied");
      return false;
    }

    if (permission !== "granted") {
      permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("[notifications] Permission not granted:", permission);
        return false;
      }
    }

    // 2) SW ready
    const reg = await navigator.serviceWorker.ready;

    // 3) Subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // 4) Pošleme subscription na BE
    await api.post("push/subscribe", { json: sub });

    // 5) Nastavíme flag v profilu
    await api.post("profile/notifications", {
      json: { notificationsEnabled: true },
    });

    console.log("[notifications] Enabled successfully");
    return true;
  } catch (err) {
    console.error("[notifications] enable failed:", err);
    return false;
  }
}

/**
 * Vypne notifikace:
 *  - zruší subscription (pokud existuje)
 *  - nastaví notificationsEnabled = false na BE
 */
export async function disableNotificationsOnClient(): Promise<void> {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
    }

    await api.post("profile/notifications", {
      json: { notificationsEnabled: false },
    });

    console.log("[notifications] Disabled successfully");
  } catch (err) {
    console.warn("[notifications] disable failed:", err);
  }
}