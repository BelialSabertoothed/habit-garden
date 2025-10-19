import { Router, type Request, type Response } from "express";
import { User } from "../models/User.js";

const router = Router();

router.post("/demo", async (_req: Request, res: Response) => {
  const email = `demo+${Date.now()}@habit.garden`;
  const u = await User.create({ email, nickname: "Demo" });
  res.status(201).json({ id: u._id.toString(), email: u.email });
});

export default router;
