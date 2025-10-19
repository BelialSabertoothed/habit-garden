import { Router, type Request, type Response } from "express";
import { UserExperiment } from "../models/Experiment.js";
import { requireUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
const assignVariant = (): "control" | "garden" =>
  Math.random() < 0.5 ? "control" : "garden";

router.get(
  "/",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    let exp = await UserExperiment.findOne({ userId, featureKey: "habit_garden_core" });
    if (!exp) {
      exp = await UserExperiment.create({ userId, featureKey: "habit_garden_core", variant: assignVariant() });
    }
    res.json({ variant: exp.variant });
  })
);

export default router;
