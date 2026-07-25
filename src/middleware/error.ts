import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  const e = err as { code?: number; name?: string };
  if (e?.code === 11000)
    return res.status(409).json({ error: "Duplicate key (email already exists)" });
  // Malformed ObjectId (or other cast failures) → client error, not server error
  if (e?.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  // Mongoose schema validation (e.g. findByIdAndUpdate with runValidators)
  if (e?.name === "ValidationError") return res.status(400).json({ error: "Validation failed" });
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
