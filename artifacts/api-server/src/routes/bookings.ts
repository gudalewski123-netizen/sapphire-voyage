import { Router, type IRouter } from "express";
import { db, bookingsTable, blockedSlotsTable, insertBookingSchema } from "@workspace/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireAdmin, requireAuth, verifyToken } from "../lib/auth";
import type { Request, Response } from "express";

const router: IRouter = Router();

// Operating hours → candidate pickup slots (local PR time, AST, no DST).
// One ride per slot keeps the single-driver schedule honest.
const OPEN_HOUR = 5; // 5:00 AM — early airport runs
const CLOSE_HOUR = 23; // last slot starts 11:00 PM
const SLOT_MINUTES = 60;

function allSlots(): string[] {
  const out: string[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Soft auth — link a booking to the customer if they're logged in, but don't require it.
function softUserId(req: Request): number | null {
  const token = req.cookies?.auth_token;
  if (!token) return null;
  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
}

// GET /api/availability?date=YYYY-MM-DD → [{ time, available }]
router.get("/availability", async (req: Request, res: Response): Promise<void> => {
  const date = String(req.query.date ?? "");
  if (!DATE_RE.test(date)) {
    res.status(400).json({ error: "date query param must be YYYY-MM-DD" });
    return;
  }

  const booked = await db
    .select({ time: bookingsTable.time })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.date, date), inArray(bookingsTable.status, ["pending", "confirmed"])));

  const blocked = await db
    .select({ time: blockedSlotsTable.time })
    .from(blockedSlotsTable)
    .where(eq(blockedSlotsTable.date, date));

  const wholeDayBlocked = blocked.some((b) => b.time === null);
  const takenTimes = new Set<string>([
    ...booked.map((b) => b.time),
    ...blocked.filter((b) => b.time !== null).map((b) => b.time as string),
  ]);

  const slots = allSlots().map((time) => ({
    time,
    available: !wholeDayBlocked && !takenTimes.has(time),
  }));

  res.json({ date, slots });
});

// POST /api/bookings — public. Creates a booking; rejects if the slot is taken.
router.post("/bookings", async (req: Request, res: Response): Promise<void> => {
  const parsed = insertBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  if (!DATE_RE.test(data.date)) {
    res.status(400).json({ error: "date must be YYYY-MM-DD" });
    return;
  }
  if (!allSlots().includes(data.time)) {
    res.status(400).json({ error: "time is not a valid slot" });
    return;
  }

  try {
    // Re-check the slot is free at write time to prevent double-booking.
    const clash = await db
      .select({ id: bookingsTable.id })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.date, data.date),
          eq(bookingsTable.time, data.time),
          inArray(bookingsTable.status, ["pending", "confirmed"]),
        ),
      )
      .limit(1);

    const blocked = await db
      .select({ time: blockedSlotsTable.time })
      .from(blockedSlotsTable)
      .where(eq(blockedSlotsTable.date, data.date));
    const slotBlocked = blocked.some(
      (b: { time: string | null }) => b.time === null || b.time === data.time,
    );

    if (clash.length > 0 || slotBlocked) {
      res.status(409).json({ error: "That time slot was just taken. Please pick another." });
      return;
    }

    const [row] = await db
      .insert(bookingsTable)
      .values({
        ...data,
        customerId: softUserId(req),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        name: data.name.trim(),
        passengers: data.passengers ?? 1,
      })
      .returning();

    req.log?.info({ bookingId: row.id }, "Booking created");
    res.status(201).json(row);
  } catch (err) {
    req.log?.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// GET /api/bookings/mine — customer. Their own booking history.
router.get("/bookings/mine", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId as number;
  const rows = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.customerId, userId))
    .orderBy(desc(bookingsTable.createdAt));
  res.json(rows);
});

// ---- Admin ----

// GET /api/admin/bookings — all bookings, newest first.
router.get("/admin/bookings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  res.json(rows);
});

// PATCH /api/admin/bookings/:id — update status / priceQuote / adminNotes.
router.patch("/admin/bookings/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { status, priceQuote, adminNotes } = req.body as {
    status?: string;
    priceQuote?: string;
    adminNotes?: string;
  };
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `status must be one of ${validStatuses.join(", ")}` });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (priceQuote !== undefined) updates.priceQuote = priceQuote;
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }
  const [updated] = await db.update(bookingsTable).set(updates).where(eq(bookingsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(updated);
});

// DELETE /api/admin/bookings/:id — hard delete.
router.delete("/admin/bookings/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(bookingsTable).where(eq(bookingsTable.id, id)).returning({ id: bookingsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json({ ok: true });
});

// ---- Admin availability control (blocked slots) ----

// GET /api/admin/blocked-slots
router.get("/admin/blocked-slots", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(blockedSlotsTable).orderBy(desc(blockedSlotsTable.date));
  res.json(rows);
});

// POST /api/admin/blocked-slots — body { date, time?, reason? }. Omit time to block the whole day.
router.post("/admin/blocked-slots", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { date, time, reason } = req.body as { date?: string; time?: string; reason?: string };
  if (!date || !DATE_RE.test(date)) {
    res.status(400).json({ error: "date (YYYY-MM-DD) is required" });
    return;
  }
  if (time && !allSlots().includes(time)) {
    res.status(400).json({ error: "time is not a valid slot" });
    return;
  }
  const [row] = await db
    .insert(blockedSlotsTable)
    .values({ date, time: time ?? null, reason: reason ?? null })
    .returning();
  res.status(201).json(row);
});

// DELETE /api/admin/blocked-slots/:id
router.delete("/admin/blocked-slots/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(blockedSlotsTable)
    .where(eq(blockedSlotsTable.id, id))
    .returning({ id: blockedSlotsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Blocked slot not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
