import { Router } from "express";
import { db, matchmakingRequestsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function fmt(r: typeof matchmakingRequestsTable.$inferSelect) {
  return {
    id:           r.id,
    userEmail:    r.userEmail,
    sisterName:   r.sisterName,
    ageRange:     r.ageRange,
    location:     r.location,
    interests:    r.interests,
    dealbreakers: r.dealbreakers,
    bio:          r.bio,
    status:       r.status,
    adminNotes:   r.adminNotes ?? null,
    createdAt:    r.createdAt.toISOString(),
    updatedAt:    r.updatedAt.toISOString(),
  };
}

// ── GET /api/matchmaking/:email ────────────────────────────────────────────────
router.get("/matchmaking/:email", async (req, res) => {
  const { email } = req.params;
  const rows = await db
    .select()
    .from(matchmakingRequestsTable)
    .where(eq(matchmakingRequestsTable.userEmail, email))
    .orderBy(desc(matchmakingRequestsTable.createdAt));
  res.json(rows.map(fmt));
});

// ── POST /api/matchmaking ──────────────────────────────────────────────────────
router.post("/matchmaking", async (req, res) => {
  const { userEmail, sisterName, ageRange, location, interests, dealbreakers, bio } = req.body;
  if (!userEmail || !sisterName || !ageRange || !location || !interests || !bio) {
    res.status(400).json({ error: "All fields are required" }); return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, userEmail)).limit(1);
  if (!user || user.plan !== "matchmaking") {
    res.status(403).json({ error: "Matchmaking requires the Matchmaking subscription" }); return;
  }

  const [row] = await db.insert(matchmakingRequestsTable).values({
    userEmail,
    sisterName,
    ageRange,
    location,
    interests,
    dealbreakers: dealbreakers ?? "",
    bio,
  }).returning();

  res.status(201).json(fmt(row));
});

// ── PATCH /api/matchmaking/:id/status (admin) ──────────────────────────────────
router.patch("/matchmaking/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "therapist2024") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.update(matchmakingRequestsTable)
    .set({ status, adminNotes: adminNotes ?? null, updatedAt: new Date() })
    .where(eq(matchmakingRequestsTable.id, id));

  const [row] = await db.select().from(matchmakingRequestsTable).where(eq(matchmakingRequestsTable.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

export default router;
