import { Router, type Request, type Response } from "express";
import { requireUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HabitLog } from "../models/HabitLog.js";

const router = Router();

router.get(
  "/weekly",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 6);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);

    const data = await HabitLog.aggregate([
      { $match: { userId, date: { $gte: fromStr, $lte: toStr } } },
      { $group: { _id: "$date", completed: { $sum: { $cond: ["$completed", 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ days: data });
  })
);

export default router;
