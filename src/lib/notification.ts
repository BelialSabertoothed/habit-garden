import { api } from "./api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

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
  } catch (error) {
    console.error("[Notification] Failed to convert VAPID key:", error);
    throw new Error(`Invalid VAPID key format. Key length: ${base64String?.length}`);
  }
}
export async function enableNotificationsOnClient(): Promise<boolean> {
  // 1. Kontrola podpory v prohlížeči
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    console.warn("[Notification] Push API not supported");
    return false;
  }

  // 2. Kontrola VAPID klíče
  if (!VAPID_PUBLIC_KEY) {
    console.error("[Notification] Missing VITE_VAPID_PUBLIC_KEY environment variable");
    return false;
  }

  try {
    // 3. Registrace Service Workeru (jistota, že běží)
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      console.error("[Notification] No Service Worker registered. App setup issue?");
      // Pokus o nouzovou registraci (pokud by v main.tsx selhala)
      await navigator.serviceWorker.register("/service-worker.js");
    }

    const readyReg = await navigator.serviceWorker.ready;

    // 4. Oprávnění (Permission)
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("[Notification] Permission denied by user");
      return false;
    }

    let sub = await readyReg.pushManager.getSubscription();

    if (!sub) {
      console.log("[Notification] Creating new subscription...");
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      sub = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    } else {

      console.log("[Notification] Found existing subscription");
    }

    // 6. Odeslání na backend
    console.log("[Notification] Sending subscription to backend...");
    await api.post("push/subscribe", { json: sub });
    console.log("[Notification] Successfully subscribed!");

    return true;
  } catch (err: any) {
    console.error("[Notification] Enable failed with error:", err);
    
    // Specifická detekce "push service error"
    if (err.name === "AbortError" || err.message?.includes("push service")) {
      console.error("👉 HINT: This often means the VAPID public key is invalid or doesn't match the private key on the server.");
    }
    
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
        console.log("[Notification] Unsubscribed locally");
      }
    }
  } catch (err) {
    console.warn("[Notification] Disable failed:", err);
  }
}