import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { AppError } from "./error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing or invalid Authorization header");
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

export function authorize(...roles: Array<"user" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Not authenticated");
    if (!roles.includes(req.user.role)) throw new AppError(403, "Forbidden");
    next();
  };
}
