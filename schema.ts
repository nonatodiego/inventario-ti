import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Inventory Records Table
 * Stores all IT equipment and resource assignments to users
 */
export const inventoryRecords = sqliteTable("inventory_records", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  
  // User Information
  userName: text("userName").notNull(),
  userRole: text("userRole").notNull(),
  location: text("location").notNull(),
  manager: text("manager").notNull(),
  
  // Email License
  emailLicense: text("emailLicense", { enum: ["E1", "E3"] }).notNull(),
  
  // Resources - Boolean flags (SQLite uses 0/1 for boolean)
  hasPhone: integer("hasPhone", { mode: "boolean" }).default(false),
  hasMonitor: integer("hasMonitor", { mode: "boolean" }).default(false),
  hasMouse: integer("hasMouse", { mode: "boolean" }).default(false),
  hasKeyboard: integer("hasKeyboard", { mode: "boolean" }).default(false),
  hasHeadset: integer("hasHeadset", { mode: "boolean" }).default(false),
  hasNotebookStand: integer("hasNotebookStand", { mode: "boolean" }).default(false),
  hasNotebook: integer("hasNotebook", { mode: "boolean" }).default(false),
  hasDesktop: integer("hasDesktop", { mode: "boolean" }).default(false),
  
  // Term/Agreement
  termAttached: integer("termAttached", { mode: "boolean" }).default(false),
  termFileName: text("termFileName"),
  termFileData: text("termFileData"), // Base64 encoded PDF
  
  // Registration Date
  regDate: text("regDate").notNull(),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type InventoryRecord = typeof inventoryRecords.$inferSelect;
export type InsertInventoryRecord = typeof inventoryRecords.$inferInsert;

/**
 * Phone Details Table
 */
export const phoneDetails = sqliteTable("phone_details", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
  chipNumber: text("chipNumber"),
  imei: text("imei"),
  pulsusId: text("pulsusId"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type PhoneDetail = typeof phoneDetails.$inferSelect;
export type InsertPhoneDetail = typeof phoneDetails.$inferInsert;

/**
 * Notebook Details Table
 */
export const notebookDetails = sqliteTable("notebook_details", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
  serialNumber: text("serialNumber"),
  hostname: text("hostname"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type NotebookDetail = typeof notebookDetails.$inferSelect;
export type InsertNotebookDetail = typeof notebookDetails.$inferInsert;

/**
 * Desktop Details Table
 */
export const desktopDetails = sqliteTable("desktop_details", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
  serialNumber: text("serialNumber"),
  hostname: text("hostname"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type DesktopDetail = typeof desktopDetails.$inferSelect;
export type InsertDesktopDetail = typeof desktopDetails.$inferInsert;

/**
 * Available Resources Table
 */
export const availableResources = sqliteTable("available_resources", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  resourceType: text("resourceType", { 
    enum: [
      "notebook",
      "monitor",
      "headset",
      "phone",
      "desktop",
      "mouse",
      "keyboard",
      "notebookStand"
    ]
  }).notNull(),
  quantity: integer("quantity", { mode: "number" }).notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type AvailableResource = typeof availableResources.$inferSelect;
export type InsertAvailableResource = typeof availableResources.$inferInsert;
