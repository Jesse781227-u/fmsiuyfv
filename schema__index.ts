import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersTable = pgTable("fms_users", {
  id:           uuid("id").primaryKey().defaultRandom(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  sisterName:   text("sister_name").notNull(),
  plan:         text("plan").notNull().default("free"), // free | private | matchmaking
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ─── Spills (public confessions) ─────────────────────────────────────────────
export const spillsTable = pgTable("fms_spills", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  text:                 text("text").notNull().default(""),
  voiceData:            text("voice_data"),
  sisterName:           text("sister_name").notNull(),
  category:             text("category").notNull(),
  isPriority:           boolean("is_priority").notNull().default(false),
  heartCount:           integer("heart_count").notNull().default(0),
  prayCount:            integer("pray_count").notNull().default(0),
  relateCount:          integer("relate_count").notNull().default(0),
  hugCount:             integer("hug_count").notNull().default(0),
  therapistResponse:    text("therapist_response"),
  therapistRespondedAt: timestamp("therapist_responded_at"),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
});

export const insertSpillSchema = createInsertSchema(spillsTable).omit({ id: true, createdAt: true, heartCount: true, prayCount: true, relateCount: true, hugCount: true });
export type InsertSpill = z.infer<typeof insertSpillSchema>;
export type Spill = typeof spillsTable.$inferSelect;

// ─── Reactions ────────────────────────────────────────────────────────────────
export const reactionsTable = pgTable("fms_reactions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  spillId:      uuid("spill_id").notNull().references(() => spillsTable.id, { onDelete: "cascade" }),
  userKey:      text("user_key").notNull(),
  reactionType: text("reaction_type").notNull(), // heart | pray | relate | hug
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export type Reaction = typeof reactionsTable.$inferSelect;

// ─── Replies ──────────────────────────────────────────────────────────────────
export const repliesTable = pgTable("fms_replies", {
  id:            uuid("id").primaryKey().defaultRandom(),
  spillId:       uuid("spill_id").notNull().references(() => spillsTable.id, { onDelete: "cascade" }),
  parentReplyId: uuid("parent_reply_id"),
  sisterName:    text("sister_name").notNull(),
  text:          text("text").notNull(),
  voiceData:     text("voice_data"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

export const insertReplySchema = createInsertSchema(repliesTable).omit({ id: true, createdAt: true });
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Reply = typeof repliesTable.$inferSelect;

// ─── Private Messages (Private Confessions - ₦15,000/month) ──────────────────
export const privateMessagesTable = pgTable("fms_private_messages", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userEmail: text("user_email").notNull(),
  text:      text("text").notNull(),
  sender:    text("sender").notNull(), // user | therapist
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPrivateMessageSchema = createInsertSchema(privateMessagesTable).omit({ id: true, createdAt: true });
export type InsertPrivateMessage = z.infer<typeof insertPrivateMessageSchema>;
export type PrivateMessage = typeof privateMessagesTable.$inferSelect;

// ─── Priority Confessions (₦5,000 one-time) ──────────────────────────────────
export const priorityConfessionsTable = pgTable("fms_priority_confessions", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  userEmail:            text("user_email").notNull(),
  sisterName:           text("sister_name").notNull(),
  text:                 text("text").notNull(),
  category:             text("category").notNull(),
  therapistResponse:    text("therapist_response"),
  therapistRespondedAt: timestamp("therapist_responded_at"),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
});

export const insertPriorityConfessionSchema = createInsertSchema(priorityConfessionsTable).omit({ id: true, createdAt: true, therapistResponse: true, therapistRespondedAt: true });
export type InsertPriorityConfession = z.infer<typeof insertPriorityConfessionSchema>;
export type PriorityConfession = typeof priorityConfessionsTable.$inferSelect;

// ─── Matchmaking Requests (Matchmaking - ₦50,000/month) ──────────────────────
export const matchmakingRequestsTable = pgTable("fms_matchmaking_requests", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userEmail:      text("user_email").notNull(),
  sisterName:     text("sister_name").notNull(),
  ageRange:       text("age_range").notNull(),
  location:       text("location").notNull(),
  interests:      text("interests").notNull(),
  dealbreakers:   text("dealbreakers").notNull().default(""),
  bio:            text("bio").notNull(),
  status:         text("status").notNull().default("pending"), // pending | matched | closed
  adminNotes:     text("admin_notes"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export const insertMatchmakingRequestSchema = createInsertSchema(matchmakingRequestsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, adminNotes: true });
export type InsertMatchmakingRequest = z.infer<typeof insertMatchmakingRequestSchema>;
export type MatchmakingRequest = typeof matchmakingRequestsTable.$inferSelect;
