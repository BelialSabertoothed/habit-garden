import type { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../lib/jwt.js";

export function requireJwt(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "missing bearer token" });

  try {
    const payload = verifyAccess(token);
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}
