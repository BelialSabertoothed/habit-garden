export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isLocalhost && window.location.protocol !== "https:") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("[SW] Registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("[SW] Registration failed:", error);
      });
  });
}