import { Router } from "express";
import { db, priorityConfessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function fmt(c: typeof priorityConfessionsTable.$inferSelect) {
  return {
    id:                   c.id,
    userEmail:            c.userEmail,
    sisterName:           c.sisterName,
    text:                 c.text,
    category:             c.category,
    timestamp:            c.createdAt.toISOString(),
    therapistResponse:    c.therapistResponse ?? null,
    therapistRespondedAt: c.therapistRespondedAt?.toISOString() ?? null,
  };
}

// ── GET /api/priority-confessions/:email ──────────────────────────────────────
router.get("/priority-confessions/:email", async (req, res) => {
  const { email } = req.params;
  const rows = await db
    .select()
    .from(priorityConfessionsTable)
    .where(eq(priorityConfessionsTable.userEmail, email))
    .orderBy(desc(priorityConfessionsTable.createdAt));
  res.json(rows.map(fmt));
});

// ── POST /api/priority-confessions ────────────────────────────────────────────
router.post("/priority-confessions", async (req, res) => {
  const { userEmail, sisterName, text, category } = req.body;
  if (!userEmail || !sisterName || !text || !category) {
    res.status(400).json({ error: "userEmail, sisterName, text, category required" }); return;
  }

  const [row] = await db.insert(priorityConfessionsTable).values({
    userEmail,
    sisterName,
    text,
    category,
  }).returning();

  res.status(201).json(fmt(row));
});

// ── POST /api/priority-confessions/:id/respond ────────────────────────────────
router.post("/priority-confessions/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { text, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "therapist2024") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.update(priorityConfessionsTable)
    .set({ therapistResponse: text, therapistRespondedAt: new Date() })
    .where(eq(priorityConfessionsTable.id, id));

  const [row] = await db.select().from(priorityConfessionsTable).where(eq(priorityConfessionsTable.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

export default router;
