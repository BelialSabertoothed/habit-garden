import type { Request, Response, NextFunction } from "express";

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const uid =
    (req.headers["x-user-id"] as string | undefined) ??
    (req.query.userId as string | undefined) ??
    (req.body?.userId as string | undefined);

  if (!uid) return res.status(401).json({ error: "unauthorized: provide x-user-id header" });

  req.userId = uid;
  next();
};
