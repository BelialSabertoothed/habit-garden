export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("[SW] Service workers are not supported in this browser.");
    return;
  }

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isLocalhost && window.location.protocol !== "https:") {
    console.log("[SW] Needs HTTPS or localhost.");
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