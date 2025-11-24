import { useState } from "react";
import { api } from "../lib/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enable = async () => {
    setIsEnabling(true);
    setError(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push not supported in this browser");
      }

      const reg = await navigator.serviceWorker.ready;

      // 1) GET public key z BE
      const res = await api.get("push/public-key");
      const { publicKey } =
        typeof (res as any).json === "function" ? await (res as any).json() : res;

      // 2) požádej usera o permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notifications permission denied");
      }

      // 3) subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4) pošli subscription na BE
      await api.post("push/subscribe", {
        json: sub.toJSON(),
      });

      return true;
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to enable notifications");
      return false;
    } finally {
      setIsEnabling(false);
    }
  };

  return { enable, isEnabling, error };
}