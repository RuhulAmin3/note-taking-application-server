import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err && typeof err === "object" && (err as any).code === 11000)
    return res.status(409).json({ error: "Duplicate key (email already exists)" });
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
