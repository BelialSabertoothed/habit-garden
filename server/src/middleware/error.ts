import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, 'API error');
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({ error: (err as Error).message || "Server error" });
};
