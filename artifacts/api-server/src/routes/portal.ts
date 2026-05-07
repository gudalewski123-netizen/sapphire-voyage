import { Router, type IRouter } from "express";
import { db, siteChangeRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import type { Request, Response } from "express";

const router: IRouter = Router();

router.get("/portal/requests", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const requests = await db
    .select()
    .from(siteChangeRequestsTable)
    .where(eq(siteChangeRequestsTable.userId, user.userId))
    .orderBy(desc(siteChangeRequestsTable.createdAt));
  res.json(requests);
});

router.post("/portal/requests", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { requestType, businessName, phone, aboutText, servicesText, pricingNotes, photoNotes, promptText } = req.body;

  if (!requestType || !["structured", "custom"].includes(requestType)) {
    res.status(400).json({ error: "Invalid request type" });
    return;
  }

  if (requestType === "custom" && !promptText) {
    res.status(400).json({ error: "Prompt text is required for custom requests" });
    return;
  }

  const [request] = await db.insert(siteChangeRequestsTable).values({
    userId: user.userId,
    requestType,
    businessName: businessName ?? null,
    phone: phone ?? null,
    aboutText: aboutText ?? null,
    servicesText: servicesText ?? null,
    pricingNotes: pricingNotes ?? null,
    photoNotes: photoNotes ?? null,
    promptText: promptText ?? null,
  }).returning();

  req.log.info({ requestId: request.id, userId: user.userId }, "Change request submitted");
  res.status(201).json(request);
});

export default router;
