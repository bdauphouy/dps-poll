import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Admin email whitelist - only emails in this table can log in
// Add emails directly to database using Turso CLI or dashboard
export const adminEmails = sqliteTable("admin_emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// OTP codes for authentication
export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const pageViews = sqliteTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: text("poll_id"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Custom Polls
export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  logoUrl: text("logo_url"),
  status: text("status").notNull().default("draft"), // 'draft' | 'active' | 'ended'
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const pollQuestions = sqliteTable("poll_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'email' | 'rating' | 'text' | 'multiple_choice' | 'checkbox'
  question: text("question").notNull(),
  questionEn: text("question_en"),
  options: text("options"), // JSON array for multiple_choice/checkbox
  optionsEn: text("options_en"), // JSON array for English translations
  required: integer("required", { mode: "boolean" }).notNull().default(true),
  orderIndex: integer("order_index").notNull(),
});

export const pollResponses = sqliteTable("poll_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  answers: text("answers").notNull(), // JSON object { questionId: answer }
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Types
export type PollStatus = "draft" | "active" | "ended";
export type AdminEmail = typeof adminEmails.$inferSelect;
export type NewAdminEmail = typeof adminEmails.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type PollQuestion = typeof pollQuestions.$inferSelect;
export type NewPollQuestion = typeof pollQuestions.$inferInsert;
export type PollResponse = typeof pollResponses.$inferSelect;
export type NewPollResponse = typeof pollResponses.$inferInsert;
