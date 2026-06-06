import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import type { Request, Response } from "express";

const router: IRouter = Router();

function cookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body ?? {};
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Name, email, phone, and password are required" });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    name: String(name).trim(),
    phone: String(phone).trim(),
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, name: user.name ?? undefined, phone: user.phone ?? undefined });
  res.cookie("auth_token", token, cookieOpts());

  req.log.info({ userId: user.id }, "Customer registered");
  res.status(201).json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
});

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, name: user.name ?? undefined, phone: user.phone ?? undefined });
  res.cookie("auth_token", token, cookieOpts());

  req.log.info({ userId: user.id }, "Customer logged in");
  res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
});

router.post("/auth/logout", (_req: Request, res: Response): void => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, (req: Request, res: Response): void => {
  res.json((req as any).user);
});

export default router;
