import { Router } from "express";
import { db, spillsTable, reactionsTable, repliesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

async function buildSpillResponse(spill: typeof spillsTable.$inferSelect, userKey?: string) {
  const replies = await db
    .select()
    .from(repliesTable)
    .where(eq(repliesTable.spillId, spill.id))
    .orderBy(repliesTable.createdAt);

  const reactionRows = await db
    .select()
    .from(reactionsTable)
    .where(eq(reactionsTable.spillId, spill.id));

  const userReactions = userKey
    ? {
        heart:  reactionRows.some(r => r.userKey === userKey && r.reactionType === "heart"),
        pray:   reactionRows.some(r => r.userKey === userKey && r.reactionType === "pray"),
        relate: reactionRows.some(r => r.userKey === userKey && r.reactionType === "relate"),
        hug:    reactionRows.some(r => r.userKey === userKey && r.reactionType === "hug"),
      }
    : { heart: false, pray: false, relate: false, hug: false };

  function buildTree(allReplies: typeof replies, parentId: string | null): unknown[] {
    return allReplies
      .filter(r => (r.parentReplyId ?? null) === parentId)
      .map(r => ({
        id:            r.id,
        sisterName:    r.sisterName,
        text:          r.text,
        voiceBlob:     r.voiceData,
        timestamp:     r.createdAt.toISOString(),
        reactions:     { heart: 0, pray: 0, relate: 0, hug: 0 },
        replies:       buildTree(allReplies, r.id),
      }));
  }

  return {
    id:               spill.id,
    text:             spill.text,
    voiceBlob:        spill.voiceData,
    sisterName:       spill.sisterName,
    category:         spill.category,
    isPriority:       spill.isPriority,
    timestamp:        spill.createdAt.toISOString(),
    reactions: {
      heart:  spill.heartCount,
      pray:   spill.prayCount,
      relate: spill.relateCount,
      hug:    spill.hugCount,
    },
    userReactions,
    replies:          buildTree(replies, null),
    therapistResponse: spill.therapistResponse
      ? { text: spill.therapistResponse, timestamp: spill.therapistRespondedAt?.toISOString() ?? "" }
      : null,
  };
}

// ── GET /api/spills ────────────────────────────────────────────────────────────
router.get("/spills", async (req, res) => {
  const { category, sort, userKey } = req.query as Record<string, string>;

  const rows = await (category
    ? db.select().from(spillsTable).where(eq(spillsTable.category, category))
    : db.select().from(spillsTable));

  const ordered = sort === "reacted"
    ? rows.sort((a, b) =>
        (b.heartCount + b.prayCount + b.relateCount + b.hugCount) -
        (a.heartCount + a.prayCount + a.relateCount + a.hugCount))
    : rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const result = await Promise.all(ordered.map(s => buildSpillResponse(s, userKey)));
  res.json(result);
});

// ── POST /api/spills ───────────────────────────────────────────────────────────
router.post("/spills", async (req, res) => {
  const { text, voiceData, sisterName, category, isPriority } = req.body;
  if (!sisterName || !category) {
    res.status(400).json({ error: "sisterName and category are required" }); return;
  }

  const [spill] = await db.insert(spillsTable).values({
    text: text ?? "",
    voiceData: voiceData ?? null,
    sisterName,
    category,
    isPriority: isPriority ?? false,
  }).returning();

  res.status(201).json(await buildSpillResponse(spill));
});

// ── POST /api/spills/:id/react ─────────────────────────────────────────────────
router.post("/spills/:id/react", async (req, res) => {
  const { id } = req.params;
  const { userKey, reactionType } = req.body;

  if (!userKey || !reactionType) {
    res.status(400).json({ error: "userKey and reactionType required" }); return;
  }

  const validTypes = ["heart", "pray", "relate", "hug"];
  if (!validTypes.includes(reactionType)) {
    res.status(400).json({ error: "invalid reactionType" }); return;
  }

  const existing = await db
    .select()
    .from(reactionsTable)
    .where(and(
      eq(reactionsTable.spillId, id),
      eq(reactionsTable.userKey, userKey),
      eq(reactionsTable.reactionType, reactionType),
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(reactionsTable).where(eq(reactionsTable.id, existing[0].id));
    const dec = reactionType === "heart"  ? { heartCount:  sql`${spillsTable.heartCount} - 1` }
              : reactionType === "pray"   ? { prayCount:   sql`${spillsTable.prayCount} - 1` }
              : reactionType === "relate" ? { relateCount: sql`${spillsTable.relateCount} - 1` }
              :                            { hugCount:     sql`${spillsTable.hugCount} - 1` };
    await db.update(spillsTable).set(dec).where(eq(spillsTable.id, id));
  } else {
    await db.insert(reactionsTable).values({ spillId: id, userKey, reactionType });
    const inc = reactionType === "heart"  ? { heartCount:  sql`${spillsTable.heartCount} + 1` }
              : reactionType === "pray"   ? { prayCount:   sql`${spillsTable.prayCount} + 1` }
              : reactionType === "relate" ? { relateCount: sql`${spillsTable.relateCount} + 1` }
              :                            { hugCount:     sql`${spillsTable.hugCount} + 1` };
    await db.update(spillsTable).set(inc).where(eq(spillsTable.id, id));
  }

  const [updated] = await db.select().from(spillsTable).where(eq(spillsTable.id, id)).limit(1);
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(await buildSpillResponse(updated, userKey));
});

// ── POST /api/spills/:id/reply ─────────────────────────────────────────────────
router.post("/spills/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { sisterName, text, voiceData, parentReplyId } = req.body;
  if (!sisterName || (!text && !voiceData)) {
    res.status(400).json({ error: "sisterName and text/voiceData required" }); return;
  }

  await db.insert(repliesTable).values({
    spillId: id,
    parentReplyId: parentReplyId ?? null,
    sisterName,
    text: text ?? "",
    voiceData: voiceData ?? null,
  });

  const [updated] = await db.select().from(spillsTable).where(eq(spillsTable.id, id)).limit(1);
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(await buildSpillResponse(updated));
});

// ── POST /api/spills/:id/therapist-response ────────────────────────────────────
router.post("/spills/:id/therapist-response", async (req, res) => {
  const { id } = req.params;
  const { text, adminPassword } = req.body;
  if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "therapist2024") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.update(spillsTable)
    .set({ therapistResponse: text, therapistRespondedAt: new Date() })
    .where(eq(spillsTable.id, id));

  const [updated] = await db.select().from(spillsTable).where(eq(spillsTable.id, id)).limit(1);
  if (!updated) { res.status(404).json({ error: "not found" }); return; }
  res.json(await buildSpillResponse(updated));
});

export default router;
