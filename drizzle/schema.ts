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

/**
 * License History Table
 * Stores the history of email license movements and transfers
 * Append-only table: only INSERT operations allowed
 */
export const licenseHistory = sqliteTable("license_history", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  
  // License type (E1 or E3)
  licenseType: text("licenseType", { enum: ["E1", "E3"] }).notNull(),
  
  // User who previously had the license (null for new assignments)
  fromUser: text("fromUser"),
  
  // User who now has the license (null for removals)
  toUser: text("toUser"),
  
  // Timestamp of the transfer
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type LicenseHistory = typeof licenseHistory.$inferSelect;
export type InsertLicenseHistory = typeof licenseHistory.$inferInsert;


/**
 * Systems Table
 * Stores all available systems in the organization
 */
export const systems = sqliteTable("systems", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category"), // e.g., "ERP", "CRM", "Email", "VPN", "Database"
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type System = typeof systems.$inferSelect;
export type InsertSystem = typeof systems.$inferInsert;

/**
 * Access Profiles Table
 * Stores predefined access profiles/roles for systems
 */
export const accessProfiles = sqliteTable("access_profiles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  systemId: integer("systemId", { mode: "number" }).notNull(),
  name: text("name").notNull(), // e.g., "Admin", "Editor", "Viewer", "Manager"
  description: text("description"),
  permissions: text("permissions"), // JSON string with permissions
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type AccessProfile = typeof accessProfiles.$inferSelect;
export type InsertAccessProfile = typeof accessProfiles.$inferInsert;

/**
 * Collaborator System Access Table
 * Links inventory records to systems with their access profiles
 */
export const collaboratorSystemAccess = sqliteTable("collaborator_system_access", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
  systemId: integer("systemId", { mode: "number" }).notNull(),
  accessProfileId: integer("accessProfileId", { mode: "number" }).notNull(),
  notes: text("notes"), // Additional notes about the access
  grantedAt: integer("grantedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export type CollaboratorSystemAccess = typeof collaboratorSystemAccess.$inferSelect;
export type InsertCollaboratorSystemAccess = typeof collaboratorSystemAccess.$inferInsert;
