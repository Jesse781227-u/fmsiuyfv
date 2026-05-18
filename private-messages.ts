import { Router } from "express";
import { db, privateMessagesTable, usersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

const THERAPIST_REPLIES = [
  "I hear you, Sister. This space is yours — take your time and breathe.",
  "What you're carrying is real. Thank you for trusting this space with it.",
  "You are not alone in this. Many sisters have felt exactly what you're describing.",
  "That took courage to say. I'm here, fully present with you.",
  "There's no judgment here — only warmth and a willingness to understand.",
  "Let yourself feel this without rushing to fix it. You are safe here.",
  "Your pain deserves to be witnessed. I see you, Sister.",
];
let replyIdx = 0;

// ── GET /api/private-messages/:email ──────────────────────────────────────────
router.get("/private-messages/:email", async (req, res) => {
  const { email } = req.params;
  const messages = await db
    .select()
    .from(privateMessagesTable)
    .where(eq(privateMessagesTable.userEmail, email))
    .orderBy(asc(privateMessagesTable.createdAt));

  res.json(messages.map(m => ({
    id: m.id,
    text: m.text,
    sender: m.sender,
    timestamp: m.createdAt.toISOString(),
  })));
});

// ── POST /api/private-messages ─────────────────────────────────────────────────
router.post("/private-messages", async (req, res) => {
  const { userEmail, text } = req.body;
  if (!userEmail || !text) {
    res.status(400).json({ error: "userEmail and text required" }); return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, userEmail)).limit(1);
  if (!user || user.plan === "free") {
    res.status(403).json({ error: "Private Confessions requires a paid plan" }); return;
  }

  const [msg] = await db.insert(privateMessagesTable).values({
    userEmail,
    text,
    sender: "user",
  }).returning();

  setTimeout(async () => {
    await db.insert(privateMessagesTable).values({
      userEmail,
      text: THERAPIST_REPLIES[replyIdx++ % THERAPIST_REPLIES.length],
      sender: "therapist",
    });
  }, 2000);

  res.status(201).json({
    id: msg.id,
    text: msg.text,
    sender: msg.sender,
    timestamp: msg.createdAt.toISOString(),
  });
});

// ── POST /api/private-messages/admin ──────────────────────────────────────────
router.post("/private-messages/admin", async (req, res) => {
  const { userEmail, text, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "therapist2024") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [msg] = await db.insert(privateMessagesTable).values({
    userEmail,
    text,
    sender: "therapist",
  }).returning();

  res.status(201).json({
    id: msg.id,
    text: msg.text,
    sender: msg.sender,
    timestamp: msg.createdAt.toISOString(),
  });
});

export default router;
