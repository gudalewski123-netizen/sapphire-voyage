import { Router, type IRouter } from "express";
import { db, siteChangeRequestsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import type { Request, Response } from "express";

const router: IRouter = Router();

router.get("/admin/site-changes", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const requests = await db
    .select({
      id: siteChangeRequestsTable.id,
      userId: siteChangeRequestsTable.userId,
      userEmail: usersTable.email,
      userBusinessName: usersTable.businessName,
      requestType: siteChangeRequestsTable.requestType,
      businessName: siteChangeRequestsTable.businessName,
      phone: siteChangeRequestsTable.phone,
      aboutText: siteChangeRequestsTable.aboutText,
      servicesText: siteChangeRequestsTable.servicesText,
      pricingNotes: siteChangeRequestsTable.pricingNotes,
      photoNotes: siteChangeRequestsTable.photoNotes,
      promptText: siteChangeRequestsTable.promptText,
      status: siteChangeRequestsTable.status,
      adminNotes: siteChangeRequestsTable.adminNotes,
      createdAt: siteChangeRequestsTable.createdAt,
      updatedAt: siteChangeRequestsTable.updatedAt,
    })
    .from(siteChangeRequestsTable)
    .innerJoin(usersTable, eq(siteChangeRequestsTable.userId, usersTable.id))
    .orderBy(desc(siteChangeRequestsTable.createdAt));

  res.json(requests);
});

router.patch("/admin/site-changes/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status, adminNotes } = req.body;
  const validStatuses = ["pending", "in_progress", "completed"];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (adminNotes != null) updates.adminNotes = adminNotes;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(siteChangeRequestsTable)
    .set(updates)
    .where(eq(siteChangeRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  res.json(updated);
});

export default router;
