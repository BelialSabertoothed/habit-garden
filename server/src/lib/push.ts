import webpush from "web-push";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn("⚠️ Missing VAPID keys – push notifications disabled");
}

webpush.setVapidDetails(
  "mailto:b.simordova@gmail.com",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

export function sendPush(subscription: any, payload: any) {
  return webpush.sendNotification(
    subscription,
    JSON.stringify(payload)
  );
}

export { webpush, VAPID_PUBLIC };