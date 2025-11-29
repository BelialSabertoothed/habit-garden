import { Router, type Response } from "express";
import { requireAuth, AuthReq } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { VAPID_PUBLIC, webpush } from "../lib/push.js";
import { PushSubscription } from "../models/PushSubscription.js";

const router = Router();

// GET /push/public-key – FE potřebuje VAPID public key
router.get(
  "/public-key",
  requireAuth,
  asyncHandler(async (_req: AuthReq, res: Response) => {
    res.json({ publicKey: VAPID_PUBLIC });
  })
);

// POST /push/subscribe – uloží push subscription pro usera
router.post("/subscribe", requireAuth, async (req: AuthReq, res) => {
  try {
    const sub = req.body;

    if (!sub || !sub.endpoint) {
      return res.status(400).json({ ok: false, message: "invalid subscription" });
    }


    await PushSubscription.findOneAndUpdate(
      { endpoint: sub.endpoint },
      {
        $set: {
          userId: req.userId,
          endpoint: sub.endpoint,
          keys: sub.keys,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return res.status(500).json({ ok: false });
  }
});

router.post("/test", requireAuth, async (req: AuthReq, res) => {
  try {
    const { userId } = req;
    const subs = await PushSubscription.find({ userId });

    if (!subs.length) {
      return res.status(404).json({ ok: false, message: "no subscription found" });
    }

    const promises = subs.map((sub: any)=>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        JSON.stringify({
          title: "Habit Garden",
          body: "Test notification 🌱",
        })
      )
    );

    await Promise.all(promises);

    return res.json({ ok: true, count: subs.length });
  } catch (err) {
    console.error("push test failed:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;