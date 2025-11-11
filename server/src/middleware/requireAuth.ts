import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthReq = Request & { userId?: string };

export function requireAuth(req: AuthReq, res: Response, next: NextFunction) {
  const auth = req.header("authorization") ?? "";
  const [, token] = auth.split(" ");

  if (!token) return res.status(401).json({ message: "missing access token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET! ) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}
