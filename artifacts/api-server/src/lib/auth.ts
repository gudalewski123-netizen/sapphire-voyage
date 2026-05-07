import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");

export interface JwtPayload {
  userId: number;
  email: string;
  businessName: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET!) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-admin-api-key"];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
