import { api } from "./api";

const VAPID_PUBLIC_KEY = import.meta.env
  .VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string) {
  try {
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
  } catch (e) {
    console.error("Failed to convert VAPID key. Is it a valid base64 string?", e);
    throw new Error("Invalid VAPID key format");
  }
}
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
        "[notifications] Missing VAPID public key (VITE_VAPID_PUBLIC_KEY). Check your env variables."
      );
      return false;
    }

    // 1) Permission
    let permission = Notification.permission;
    if (permission === "denied") {
      console.warn("[notifications] Permission is denied");
      // Můžeme zkusit požádat znovu, ale pravděpodobně to failne, pokud user explicitně zakázal
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
      // Konverze klíče může vyhodit chybu, pokud je klíč špatný
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 4) Pošleme subscription na BE
    await api.post("push/subscribe", { json: sub });

    return true;
  } catch (err) {
    console.error("[notifications] enable failed:", err);
    return false;
  }
}

export async function disableNotificationsOnClient(): Promise<void> {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
    }
  } catch (err) {
    console.warn("[notifications] disable failed:", err);
  }
}