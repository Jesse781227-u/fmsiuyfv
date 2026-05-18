import { Router } from "express";
import { db, spillsTable, privateMessagesTable, priorityConfessionsTable, usersTable, matchmakingRequestsTable } from "@workspace/db";
import { desc, asc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "therapist2024";

function checkAdmin(req: import("express").Request, res: import("express").Response): boolean {
  const pw = req.headers["x-admin-password"] as string ?? req.query.adminPassword as string;
  if (pw !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// ── GET /api/admin/spills ──────────────────────────────────────────────────────
router.get("/admin/spills", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const spills = await db.select().from(spillsTable).orderBy(desc(spillsTable.createdAt));
  res.json(spills.map(s => ({
    id: s.id,
    sisterName: s.sisterName,
    category: s.category,
    text: s.text,
    voiceBlob: s.voiceData,
    createdAt: s.createdAt.toISOString(),
    therapistResponse: s.therapistResponse,
    therapistRespondedAt: s.therapistRespondedAt?.toISOString(),
    heartCount: s.heartCount,
    prayCount: s.prayCount,
    relateCount: s.relateCount,
    hugCount: s.hugCount,
  })));
});

// ── GET /api/admin/private-messages ───────────────────────────────────────────
router.get("/admin/private-messages", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const msgs = await db
    .select()
    .from(privateMessagesTable)
    .orderBy(asc(privateMessagesTable.userEmail), asc(privateMessagesTable.createdAt));
  const grouped: Record<string, { userEmail: string; messages: unknown[] }> = {};
  for (const m of msgs) {
    if (!grouped[m.userEmail]) grouped[m.userEmail] = { userEmail: m.userEmail, messages: [] };
    grouped[m.userEmail].messages.push({
      id: m.id, text: m.text, sender: m.sender, timestamp: m.createdAt.toISOString()
    });
  }
  res.json(Object.values(grouped));
});

// ── GET /api/admin/priority-confessions ───────────────────────────────────────
router.get("/admin/priority-confessions", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(priorityConfessionsTable)
    .orderBy(desc(priorityConfessionsTable.createdAt));
  res.json(rows.map(c => ({
    id: c.id,
    userEmail: c.userEmail,
    sisterName: c.sisterName,
    text: c.text,
    category: c.category,
    createdAt: c.createdAt.toISOString(),
    therapistResponse: c.therapistResponse,
    therapistRespondedAt: c.therapistRespondedAt?.toISOString(),
  })));
});

// ── GET /api/admin/users ───────────────────────────────────────────────────────
router.get("/admin/users", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map(u => ({
    id: u.id, email: u.email, sisterName: u.sisterName, plan: u.plan, createdAt: u.createdAt.toISOString()
  })));
});

// ── GET /api/admin/matchmaking ─────────────────────────────────────────────────
router.get("/admin/matchmaking", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  const rows = await db
    .select()
    .from(matchmakingRequestsTable)
    .orderBy(desc(matchmakingRequestsTable.createdAt));
  res.json(rows.map(r => ({
    id: r.id,
    userEmail: r.userEmail,
    sisterName: r.sisterName,
    ageRange: r.ageRange,
    location: r.location,
    interests: r.interests,
    dealbreakers: r.dealbreakers,
    bio: r.bio,
    status: r.status,
    adminNotes: r.adminNotes ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  })));
});

export default router;
