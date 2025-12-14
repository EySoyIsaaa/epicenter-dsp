import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Processing history table
export const processingHistory = mysqlTable("processing_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileFormat: varchar("fileFormat", { length: 10 }).notNull(),
  sampleRate: int("sampleRate").notNull(),
  duration: int("duration").notNull(), // in seconds
  channels: int("channels").notNull(),
  sweepFreq: int("sweepFreq").notNull(), // 27-63 Hz
  width: int("width").notNull(), // 0-100%
  intensity: int("intensity").notNull(), // 0-100%
  presetUsed: varchar("presetUsed", { length: 50 }),
  originalFileUrl: text("originalFileUrl"),
  processedFileUrl: text("processedFileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProcessingHistory = typeof processingHistory.$inferSelect;
export type InsertProcessingHistory = typeof processingHistory.$inferInsert;

// Presets table for custom user presets
export const userPresets = mysqlTable("user_presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sweepFreq: int("sweepFreq").notNull(),
  width: int("width").notNull(),
  intensity: int("intensity").notNull(),
  genre: varchar("genre", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPreset = typeof userPresets.$inferSelect;
export type InsertUserPreset = typeof userPresets.$inferInsert;
