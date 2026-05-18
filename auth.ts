import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

function generateSisterId(): string {
  return `Sister #${Math.floor(1000 + Math.random() * 9000)}`;
}

// ── POST /api/auth/register ────────────────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" }); return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" }); return;
  }

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    sisterName: generateSisterId(),
    plan: "free",
  }).returning();

  res.status(201).json({
    id: user.id,
    email: user.email,
    sisterName: user.sisterName,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
  });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" }); return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" }); return;
  }

  res.json({
    id: user.id,
    email: user.email,
    sisterName: user.sisterName,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
  });
});

// ── PATCH /api/auth/plan ───────────────────────────────────────────────────────
router.patch("/auth/plan", async (req, res) => {
  const { email, plan } = req.body;
  if (!email || !plan) {
    res.status(400).json({ error: "email and plan required" }); return;
  }

  await db.update(usersTable).set({ plan }).where(eq(usersTable.email, email));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
    id: user.id,
    email: user.email,
    sisterName: user.sisterName,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
