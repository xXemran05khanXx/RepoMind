import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: varchar("github_id").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  plan: text("plan").notNull().default("free"), // free, pro
  queryCount: integer("query_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  githubId: varchar("github_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  language: text("language"),
  isPrivate: boolean("is_private").notNull().default(false),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, ready, error
  fileCount: integer("file_count").default(0),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repositoryFiles = pgTable("repository_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content"),
  language: text("language"),
  size: integer("size"),
  embedding: jsonb("embedding"), // Vector embedding as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commits = pgTable("commits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  sha: text("sha").notNull(),
  message: text("message").notNull(),
  author: text("author").notNull(),
  authorEmail: text("author_email"),
  date: timestamp("date").notNull(),
  additions: integer("additions").default(0),
  deletions: integer("deletions").default(0),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const queries = pgTable("queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer"),
  context: jsonb("context"), // Related files and content
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meetings (Part 4 feature)
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title"),
  source: text("source"), // upload | github_issue | external
  rawTranscript: text("raw_transcript"),
  summary: text("summary"),
  status: text("status").notNull().default('pending'), // pending | processing | ready | error
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const meetingSegments = pgTable("meeting_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  order: integer("order_index").notNull().default(0),
  startTime: integer("start_time"), // seconds offset
  endTime: integer("end_time"),
  content: text("content"),
  embedding: jsonb("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repositories: many(repositories),
  queries: many(queries),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  user: one(users, {
    fields: [repositories.userId],
    references: [users.id],
  }),
  files: many(repositoryFiles),
  commits: many(commits),
  queries: many(queries),
}));

export const repositoryFilesRelations = relations(repositoryFiles, ({ one }) => ({
  repository: one(repositories, {
    fields: [repositoryFiles.repositoryId],
    references: [repositories.id],
  }),
}));

export const commitsRelations = relations(commits, ({ one }) => ({
  repository: one(repositories, {
    fields: [commits.repositoryId],
    references: [repositories.id],
  }),
}));

export const queriesRelations = relations(queries, ({ one }) => ({
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),
  repository: one(repositories, {
    fields: [queries.repositoryId],
    references: [repositories.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  user: one(users, {
    fields: [meetings.userId],
    references: [users.id],
  }),
  segments: many(meetingSegments),
}));

export const meetingSegmentsRelations = relations(meetingSegments, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingSegments.meetingId],
    references: [meetings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
  createdAt: true,
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertMeetingSegmentSchema = createInsertSchema(meetingSegments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type RepositoryFile = typeof repositoryFiles.$inferSelect;
export type Commit = typeof commits.$inferSelect;
export type Query = typeof queries.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type MeetingSegment = typeof meetingSegments.$inferSelect;
export type InsertMeetingSegment = z.infer<typeof insertMeetingSegmentSchema>;
