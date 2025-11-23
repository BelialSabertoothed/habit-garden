
const SW_VERSION = "v1";

// Instalace SW – dobré dát skipWaiting, ať se rychle aktivuje
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install", SW_VERSION);
  self.skipWaiting();
});

// Aktivace – převezmeme kontrolu nad klienty
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate", SW_VERSION);
  event.waitUntil(self.clients.claim());
});

// Zatím NIC necacheujeme, jen logujeme fetch (můžeš klidně smazat)
self.addEventListener("fetch", (event) => {
  // console.debug("[ServiceWorker] Fetch", event.request.url);
});

// Push event – tady se budou zobrazovat notifikace
self.addEventListener("push", (event) => {
  console.log(
    "[ServiceWorker] Push received",
    event.data ? event.data.text() : "(no data)"
  );

  const data = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const title = data.title || "Habit Garden";
  const body = data.body || "Time to water your plants 🌱";

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          // 👇 TADY NOVÉ
          data: {
            url: data.url || "/#habits", // defaultně pošleme na habits
          },
        });
      } catch (err) {
        console.error("[ServiceWorker] showNotification failed:", err);
      }
    })()
  );
});

// Kliknutí na notifikaci – otevřeme /fokusujeme appku
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click", event);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});