var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
var users, inventoryRecords, phoneDetails, notebookDetails, desktopDetails, availableResources, licenseHistory, systems, accessProfiles, collaboratorSystemAccess;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = sqliteTable("users", {
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
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      lastSignedIn: integer("lastSignedIn", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    inventoryRecords = sqliteTable("inventory_records", {
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
      termFileData: text("termFileData"),
      // Base64 encoded PDF
      // Registration Date
      regDate: text("regDate").notNull(),
      // Timestamps
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    phoneDetails = sqliteTable("phone_details", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
      chipNumber: text("chipNumber"),
      imei: text("imei"),
      pulsusId: text("pulsusId"),
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    notebookDetails = sqliteTable("notebook_details", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
      serialNumber: text("serialNumber"),
      hostname: text("hostname"),
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    desktopDetails = sqliteTable("desktop_details", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
      serialNumber: text("serialNumber"),
      hostname: text("hostname"),
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    availableResources = sqliteTable("available_resources", {
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
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    licenseHistory = sqliteTable("license_history", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      // License type (E1 or E3)
      licenseType: text("licenseType", { enum: ["E1", "E3"] }).notNull(),
      // User who previously had the license (null for new assignments)
      fromUser: text("fromUser"),
      // User who now has the license (null for removals)
      toUser: text("toUser"),
      // Timestamp of the transfer
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    systems = sqliteTable("systems", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      name: text("name").notNull().unique(),
      description: text("description"),
      category: text("category"),
      // e.g., "ERP", "CRM", "Email", "VPN", "Database"
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    accessProfiles = sqliteTable("access_profiles", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      systemId: integer("systemId", { mode: "number" }).notNull(),
      name: text("name").notNull(),
      // e.g., "Admin", "Editor", "Viewer", "Manager"
      description: text("description"),
      permissions: text("permissions"),
      // JSON string with permissions
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    collaboratorSystemAccess = sqliteTable("collaborator_system_access", {
      id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      inventoryRecordId: integer("inventoryRecordId", { mode: "number" }).notNull(),
      systemId: integer("systemId", { mode: "number" }).notNull(),
      accessProfileId: integer("accessProfileId", { mode: "number" }).notNull(),
      notes: text("notes"),
      // Additional notes about the access
      grantedAt: integer("grantedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
  }
});

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { dirname } from "path";
import { mkdirSync } from "fs";
async function getDb() {
  if (!_db) {
    try {
      const dbPath = process.env.DATABASE_PATH || "/opt/inventario-ti/sqlite.db";
      const dbDir = dirname(dbPath);
      mkdirSync(dbDir, { recursive: true });
      console.log("[Database] Connecting to SQLite at:", dbPath);
      const sqlite = new Database(dbPath);
      sqlite.pragma("journal_mode = WAL");
      sqlite.pragma("synchronous = NORMAL");
      _db = drizzle(sqlite);
      console.log("[Database] Drizzle instance created with better-sqlite3");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function persistDatabase() {
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/inventory.ts
var inventory_exports = {};
__export(inventory_exports, {
  addAvailableResource: () => addAvailableResource,
  createInventoryRecord: () => createInventoryRecord,
  createLicenseHistory: () => createLicenseHistory,
  deleteAvailableResource: () => deleteAvailableResource,
  deleteInventoryRecord: () => deleteInventoryRecord,
  getAllInventoryRecords: () => getAllInventoryRecords,
  getAvailableResources: () => getAvailableResources,
  getInventoryRecordById: () => getInventoryRecordById,
  getLicenseHistory: () => getLicenseHistory,
  getLicenseHistoryByType: () => getLicenseHistoryByType,
  transferLicense: () => transferLicense,
  updateInventoryRecord: () => updateInventoryRecord
});
import { eq as eq2, desc } from "drizzle-orm";
async function createInventoryRecord(record, phoneDetail, notebookDetail, desktopDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(inventoryRecords).values(record);
    const inserted = await db.select().from(inventoryRecords).orderBy(desc(inventoryRecords.id)).limit(1);
    const recordId = inserted[0]?.id;
    if (!recordId) {
      throw new Error("Failed to retrieve inserted record ID");
    }
    console.log("[createInventoryRecord] Created record with ID:", recordId);
    if (record.hasPhone) {
      await db.insert(phoneDetails).values({
        chipNumber: phoneDetail?.chipNumber || null,
        imei: phoneDetail?.imei || null,
        pulsusId: phoneDetail?.pulsusId || null,
        inventoryRecordId: recordId
      });
    }
    if (record.hasNotebook) {
      await db.insert(notebookDetails).values({
        serialNumber: notebookDetail?.serialNumber || null,
        hostname: notebookDetail?.hostname || null,
        inventoryRecordId: recordId
      });
    }
    if (record.hasDesktop) {
      await db.insert(desktopDetails).values({
        serialNumber: desktopDetail?.serialNumber || null,
        hostname: desktopDetail?.hostname || null,
        inventoryRecordId: recordId
      });
    }
    await persistDatabase();
    return await getInventoryRecordById(recordId);
  } catch (error) {
    console.error("[Database] Failed to create inventory record:", error);
    throw error;
  }
}
async function getAllInventoryRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const allRecords = await db.select().from(inventoryRecords);
    console.log("[getAllInventoryRecords] Found", allRecords.length, "records");
    const recordsWithDetails = await Promise.all(
      allRecords.map(async (record) => {
        const phone = await db.select().from(phoneDetails).where(eq2(phoneDetails.inventoryRecordId, record.id)).limit(1);
        const notebook = await db.select().from(notebookDetails).where(eq2(notebookDetails.inventoryRecordId, record.id)).limit(1);
        const desktop = await db.select().from(desktopDetails).where(eq2(desktopDetails.inventoryRecordId, record.id)).limit(1);
        const result = {
          ...record,
          // Flatten phone details
          phoneChip: phone[0]?.chipNumber || null,
          phoneIMEI: phone[0]?.imei || null,
          phonePulsusId: phone[0]?.pulsusId || null,
          // Flatten notebook details
          notebookSerialNumber: notebook[0]?.serialNumber || null,
          notebookHostname: notebook[0]?.hostname || null,
          // Flatten desktop details
          desktopSerialNumber: desktop[0]?.serialNumber || null,
          desktopHostname: desktop[0]?.hostname || null
        };
        console.log(`[getAllInventoryRecords] Record ${record.id}: phone=${phone.length}, notebook=${notebook.length}, desktop=${desktop.length}`);
        return result;
      })
    );
    console.log("[getAllInventoryRecords] Returning", recordsWithDetails.length, "records with details");
    return recordsWithDetails;
  } catch (error) {
    console.error("[Database] Failed to get inventory records:", error);
    return [];
  }
}
async function getInventoryRecordById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const record = await db.select().from(inventoryRecords).where(eq2(inventoryRecords.id, id)).limit(1);
    if (!record[0]) {
      return null;
    }
    const phone = await db.select().from(phoneDetails).where(eq2(phoneDetails.inventoryRecordId, id)).limit(1);
    const notebook = await db.select().from(notebookDetails).where(eq2(notebookDetails.inventoryRecordId, id)).limit(1);
    const desktop = await db.select().from(desktopDetails).where(eq2(desktopDetails.inventoryRecordId, id)).limit(1);
    return {
      ...record[0],
      // Flatten phone details
      phoneChip: phone[0]?.chipNumber || null,
      phoneIMEI: phone[0]?.imei || null,
      phonePulsusId: phone[0]?.pulsusId || null,
      // Flatten notebook details
      notebookSerialNumber: notebook[0]?.serialNumber || null,
      notebookHostname: notebook[0]?.hostname || null,
      // Flatten desktop details
      desktopSerialNumber: desktop[0]?.serialNumber || null,
      desktopHostname: desktop[0]?.hostname || null
    };
  } catch (error) {
    console.error("[Database] Failed to get inventory record by ID:", error);
    return null;
  }
}
async function updateInventoryRecord(id, record, phoneDetail, notebookDetail, desktopDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(inventoryRecords).set({ ...record, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(inventoryRecords.id, id));
    if (record.hasPhone) {
      const existingPhone = await db.select().from(phoneDetails).where(eq2(phoneDetails.inventoryRecordId, id)).limit(1);
      if (existingPhone[0]) {
        await db.update(phoneDetails).set({
          chipNumber: phoneDetail?.chipNumber || null,
          imei: phoneDetail?.imei || null,
          pulsusId: phoneDetail?.pulsusId || null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(phoneDetails.inventoryRecordId, id));
      } else {
        await db.insert(phoneDetails).values({
          chipNumber: phoneDetail?.chipNumber || null,
          imei: phoneDetail?.imei || null,
          pulsusId: phoneDetail?.pulsusId || null,
          inventoryRecordId: id
        });
      }
    }
    if (record.hasNotebook) {
      const existingNotebook = await db.select().from(notebookDetails).where(eq2(notebookDetails.inventoryRecordId, id)).limit(1);
      if (existingNotebook[0]) {
        await db.update(notebookDetails).set({
          serialNumber: notebookDetail?.serialNumber || null,
          hostname: notebookDetail?.hostname || null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(notebookDetails.inventoryRecordId, id));
      } else {
        await db.insert(notebookDetails).values({
          serialNumber: notebookDetail?.serialNumber || null,
          hostname: notebookDetail?.hostname || null,
          inventoryRecordId: id
        });
      }
    }
    if (record.hasDesktop) {
      const existingDesktop = await db.select().from(desktopDetails).where(eq2(desktopDetails.inventoryRecordId, id)).limit(1);
      if (existingDesktop[0]) {
        await db.update(desktopDetails).set({
          serialNumber: desktopDetail?.serialNumber || null,
          hostname: desktopDetail?.hostname || null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(desktopDetails.inventoryRecordId, id));
      } else {
        await db.insert(desktopDetails).values({
          serialNumber: desktopDetail?.serialNumber || null,
          hostname: desktopDetail?.hostname || null,
          inventoryRecordId: id
        });
      }
    }
    await persistDatabase();
    return id;
  } catch (error) {
    console.error("[Database] Failed to update inventory record:", error);
    throw error;
  }
}
async function deleteInventoryRecord(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(phoneDetails).where(eq2(phoneDetails.inventoryRecordId, id));
    await db.delete(notebookDetails).where(eq2(notebookDetails.inventoryRecordId, id));
    await db.delete(desktopDetails).where(eq2(desktopDetails.inventoryRecordId, id));
    await db.delete(inventoryRecords).where(eq2(inventoryRecords.id, id));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete inventory record:", error);
    throw error;
  }
}
async function getAvailableResources() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.select().from(availableResources);
  } catch (error) {
    console.error("[Database] Failed to get available resources:", error);
    return [];
  }
}
async function addAvailableResource(resourceType, quantity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(availableResources).values({
      resourceType,
      quantity
    });
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to add available resource:", error);
    throw error;
  }
}
async function deleteAvailableResource(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(availableResources).where(eq2(availableResources.id, id));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete available resource:", error);
    throw error;
  }
}
async function createLicenseHistory(licenseType, fromUser, toUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(licenseHistory).values({
      licenseType,
      fromUser: fromUser || null,
      toUser: toUser || null,
      createdAt: /* @__PURE__ */ new Date()
    });
    await persistDatabase();
    console.log(`[License History] ${fromUser || "AVAILABLE"} \u2192 ${toUser || "AVAILABLE"} (${licenseType})`);
  } catch (error) {
    console.error("[Database] Failed to create license history:", error);
    throw error;
  }
}
async function getLicenseHistory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const history = await db.select().from(licenseHistory).orderBy(desc(licenseHistory.createdAt));
    return history;
  } catch (error) {
    console.error("[Database] Failed to get license history:", error);
    return [];
  }
}
async function getLicenseHistoryByType(licenseType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const history = await db.select().from(licenseHistory).where(eq2(licenseHistory.licenseType, licenseType)).orderBy(desc(licenseHistory.createdAt));
    return history;
  } catch (error) {
    console.error("[Database] Failed to get license history by type:", error);
    return [];
  }
}
async function transferLicense(inventoryId, newUserName, newLicenseType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const currentRecords = await db.select().from(inventoryRecords).where(eq2(inventoryRecords.id, inventoryId));
    const currentRecord = currentRecords[0];
    if (!currentRecord) {
      throw new Error(`Inventory record ${inventoryId} not found`);
    }
    const userChanged = currentRecord.userName !== newUserName;
    const licenseChanged = currentRecord.emailLicense !== newLicenseType;
    if (userChanged || licenseChanged) {
      await createLicenseHistory(
        newLicenseType,
        currentRecord.userName,
        newUserName
      );
    }
    await db.update(inventoryRecords).set({
      userName: newUserName,
      emailLicense: newLicenseType,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(inventoryRecords.id, inventoryId));
    console.log(`[Transfer] License transferred: ${currentRecord.userName} \u2192 ${newUserName}`);
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to transfer license:", error);
    throw error;
  }
}
var init_inventory = __esm({
  "server/inventory.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/systems.ts
var systems_exports = {};
__export(systems_exports, {
  addSystemAccessToCollaborator: () => addSystemAccessToCollaborator,
  createAccessProfile: () => createAccessProfile,
  createSystem: () => createSystem,
  deleteAccessProfile: () => deleteAccessProfile,
  deleteSystem: () => deleteSystem,
  getAccessProfilesBySystem: () => getAccessProfilesBySystem,
  getAllSystems: () => getAllSystems,
  getCollaboratorSystemAccess: () => getCollaboratorSystemAccess,
  getCollaboratorSystemAccessWithDetails: () => getCollaboratorSystemAccessWithDetails,
  getCollaboratorsWithSystemAccess: () => getCollaboratorsWithSystemAccess,
  getSystemById: () => getSystemById,
  getSystemsStatistics: () => getSystemsStatistics,
  removeSystemAccessFromCollaborator: () => removeSystemAccessFromCollaborator,
  updateAccessProfile: () => updateAccessProfile,
  updateSystem: () => updateSystem,
  updateSystemAccess: () => updateSystemAccess
});
import { eq as eq3, desc as desc2 } from "drizzle-orm";
async function getAllSystems() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const allSystems = await db.select().from(systems).orderBy(systems.name);
    return allSystems;
  } catch (error) {
    console.error("[Database] Failed to get systems:", error);
    return [];
  }
}
async function getSystemById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.select().from(systems).where(eq3(systems.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get system by ID:", error);
    return null;
  }
}
async function createSystem(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(systems).values(data);
    await persistDatabase();
    const result = await db.select().from(systems).orderBy(desc2(systems.id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create system:", error);
    throw error;
  }
}
async function getAccessProfilesBySystem(systemId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const profiles = await db.select().from(accessProfiles).where(eq3(accessProfiles.systemId, systemId)).orderBy(accessProfiles.name);
    return profiles;
  } catch (error) {
    console.error("[Database] Failed to get access profiles:", error);
    return [];
  }
}
async function createAccessProfile(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(accessProfiles).values(data);
    await persistDatabase();
    const result = await db.select().from(accessProfiles).orderBy(desc2(accessProfiles.id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create access profile:", error);
    throw error;
  }
}
async function getCollaboratorSystemAccess(inventoryRecordId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const accesses = await db.select().from(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.inventoryRecordId, inventoryRecordId)).orderBy(desc2(collaboratorSystemAccess.createdAt));
    return accesses;
  } catch (error) {
    console.error("[Database] Failed to get collaborator system access:", error);
    return [];
  }
}
async function getCollaboratorSystemAccessWithDetails(inventoryRecordId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const accesses = await db.select().from(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.inventoryRecordId, inventoryRecordId));
    const result = await Promise.all(
      accesses.map(async (access) => {
        const system = await getSystemById(access.systemId);
        const profile = await db.select().from(accessProfiles).where(eq3(accessProfiles.id, access.accessProfileId)).limit(1);
        return {
          ...access,
          system,
          profile: profile[0] || null
        };
      })
    );
    return result;
  } catch (error) {
    console.error("[Database] Failed to get collaborator system access with details:", error);
    return [];
  }
}
async function addSystemAccessToCollaborator(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.insert(collaboratorSystemAccess).values(data);
    await persistDatabase();
    const result = await db.select().from(collaboratorSystemAccess).orderBy(desc2(collaboratorSystemAccess.id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to add system access:", error);
    throw error;
  }
}
async function updateSystemAccess(accessId, accessProfileId, notes) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(collaboratorSystemAccess).set({
      accessProfileId,
      notes: notes || null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(collaboratorSystemAccess.id, accessId));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to update system access:", error);
    throw error;
  }
}
async function removeSystemAccessFromCollaborator(accessId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.id, accessId));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to remove system access:", error);
    throw error;
  }
}
async function getCollaboratorsWithSystemAccess(systemId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const accesses = await db.select().from(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.systemId, systemId));
    return accesses;
  } catch (error) {
    console.error("[Database] Failed to get collaborators with system access:", error);
    return [];
  }
}
async function updateSystem(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.update(systems).set(data).where(eq3(systems.id, id));
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to update system:", error);
    throw error;
  }
}
async function deleteSystem(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(accessProfiles).where(eq3(accessProfiles.systemId, id));
    await db.delete(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.systemId, id));
    await db.delete(systems).where(eq3(systems.id, id));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete system:", error);
    throw error;
  }
}
async function updateAccessProfile(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.update(accessProfiles).set(data).where(eq3(accessProfiles.id, id));
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to update access profile:", error);
    throw error;
  }
}
async function deleteAccessProfile(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(collaboratorSystemAccess).where(eq3(collaboratorSystemAccess.accessProfileId, id));
    await db.delete(accessProfiles).where(eq3(accessProfiles.id, id));
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete access profile:", error);
    throw error;
  }
}
async function getSystemsStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const totalSystems = await db.select().from(systems);
    const totalProfiles = await db.select().from(accessProfiles);
    const totalAccess = await db.select().from(collaboratorSystemAccess);
    return {
      totalSystems: totalSystems.length,
      totalProfiles: totalProfiles.length,
      totalCollaboratorsWithAccess: new Set(totalAccess.map((a) => a.inventoryRecordId)).size,
      systemsWithMostAccess: totalSystems.map((system) => ({
        systemId: system.id,
        systemName: system.name,
        accessCount: totalAccess.filter((a) => a.systemId === system.id).length
      })).sort((a, b) => b.accessCount - a.accessCount).slice(0, 5)
    };
  } catch (error) {
    console.error("[Database] Failed to get systems statistics:", error);
    return {
      totalSystems: 0,
      totalProfiles: 0,
      totalCollaboratorsWithAccess: 0,
      systemsWithMostAccess: []
    };
  }
}
var init_systems = __esm({
  "server/systems.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/pdfGenerator.ts
var pdfGenerator_exports = {};
__export(pdfGenerator_exports, {
  generateUserInventoryPDF: () => generateUserInventoryPDF
});
import { PDFDocument, rgb } from "pdf-lib";
async function generateUserInventoryPDF(record, systemAccess = []) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    let y = 800;
    const lineHeight = 15;
    const margin = 50;
    const drawLine = (text2, fontSize = 11, isBold = false) => {
      page.drawText(text2, {
        x: margin,
        y,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
      y -= lineHeight;
    };
    drawLine("RELAT\xD3RIO DE INVENT\xC1RIO DE TI", 16);
    y -= 10;
    drawLine("INFORMA\xC7\xD5ES DO USU\xC1RIO", 13);
    y -= 5;
    drawLine(`Nome: ${record.userName || "-"}`);
    drawLine(`Cargo: ${record.userRole || "-"}`);
    drawLine(`Localiza\xE7\xE3o: ${record.location || "-"}`);
    drawLine(`Gestor: ${record.manager || "-"}`);
    drawLine(`Licen\xE7a: ${record.emailLicense || "-"}`);
    const regDate = record.regDate ? new Date(record.regDate).toLocaleDateString("pt-BR") : "-";
    drawLine(`Data de Cadastro: ${regDate}`);
    y -= 10;
    drawLine("RECURSOS ATRIBU\xCDDOS", 13);
    y -= 5;
    const resources = [];
    if (record.hasPhone) resources.push("Celular");
    if (record.hasMonitor) resources.push("Monitor");
    if (record.hasMouse) resources.push("Mouse");
    if (record.hasKeyboard) resources.push("Teclado");
    if (record.hasHeadset) resources.push("Headset");
    if (record.hasNotebook) resources.push("Notebook");
    if (record.hasNotebookStand) resources.push("Suporte Notebook");
    if (record.hasDesktop) resources.push("Desktop");
    if (resources.length === 0) {
      drawLine("Nenhum recurso atribu\xEDdo");
    } else {
      resources.forEach((r) => drawLine(`\u2022 ${r}`));
    }
    y -= 10;
    drawLine("DETALHES DOS EQUIPAMENTOS", 13);
    y -= 5;
    if (record.hasPhone) {
      drawLine("Celular:");
      if (record.phoneChip) drawLine(`  Chip: ${record.phoneChip}`);
      if (record.phoneIMEI) drawLine(`  IMEI: ${record.phoneIMEI}`);
      if (record.phonePulsusId) drawLine(`  ID Pulsus: ${record.phonePulsusId}`);
    }
    if (record.hasNotebook) {
      drawLine("Notebook:");
      if (record.notebookSerialNumber) drawLine(`  S\xE9rie: ${record.notebookSerialNumber}`);
      if (record.notebookHostname) drawLine(`  Hostname: ${record.notebookHostname}`);
    }
    if (record.hasDesktop) {
      drawLine("Desktop:");
      if (record.desktopSerialNumber) drawLine(`  S\xE9rie: ${record.desktopSerialNumber}`);
      if (record.desktopHostname) drawLine(`  Hostname: ${record.desktopHostname}`);
    }
    y -= 10;
    drawLine("TERMO DE USO", 13);
    y -= 5;
    const termStatus = record.termAttached ? "ASSINADO" : "PENDENTE";
    drawLine(`Status: ${termStatus}`);
    y -= 10;
    drawLine("ACESSOS A SISTEMAS", 13);
    y -= 5;
    if (systemAccess.length === 0) {
      drawLine("Nenhum acesso a sistema configurado");
    } else {
      systemAccess.forEach((access) => {
        const sysName = access.system?.name || "Desconhecido";
        const profileName = access.profile?.name || "Desconhecido";
        drawLine(`\u2022 ${sysName} - Perfil: ${profileName}`);
        if (access.notes) {
          drawLine(`  Nota: ${access.notes}`, 9);
        }
      });
    }
    page.drawText(
      `Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")} \xE0s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}`,
      {
        x: margin,
        y: 30,
        size: 9,
        color: rgb(0.5, 0.5, 0.5)
      }
    );
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
}
var init_pdfGenerator = __esm({
  "server/pdfGenerator.ts"() {
    "use strict";
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var adminProcedure = publicProcedure;

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/inventoryRouter.ts
import { z as z2 } from "zod";
init_inventory();
var inventoryRouter = router({
  // Inventory Records
  list: publicProcedure.query(async () => {
    return await getAllInventoryRecords();
  }),
  get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    return await getInventoryRecordById(input.id);
  }),
  create: publicProcedure.input(
    z2.object({
      userName: z2.string().min(1),
      userRole: z2.string().min(1),
      location: z2.string().min(1),
      manager: z2.string().min(1),
      emailLicense: z2.enum(["E1", "E3"]),
      hasPhone: z2.boolean().default(false),
      hasMonitor: z2.boolean().default(false),
      hasMouse: z2.boolean().default(false),
      hasKeyboard: z2.boolean().default(false),
      hasHeadset: z2.boolean().default(false),
      hasNotebookStand: z2.boolean().default(false),
      hasNotebook: z2.boolean().default(false),
      hasDesktop: z2.boolean().default(false),
      termAttached: z2.boolean().default(false),
      termFileName: z2.string().optional(),
      termFileData: z2.string().optional(),
      regDate: z2.string(),
      // Phone details
      phoneChip: z2.string().optional(),
      phoneIMEI: z2.string().optional(),
      phonePulsusID: z2.string().optional(),
      // Notebook details
      notebookSerialNumber: z2.string().optional(),
      notebookHostname: z2.string().optional(),
      // Desktop details
      desktopSerialNumber: z2.string().optional(),
      desktopHostname: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const recordData = {
      userName: input.userName,
      userRole: input.userRole,
      location: input.location,
      manager: input.manager,
      emailLicense: input.emailLicense,
      hasPhone: input.hasPhone,
      hasMonitor: input.hasMonitor,
      hasMouse: input.hasMouse,
      hasKeyboard: input.hasKeyboard,
      hasHeadset: input.hasHeadset,
      hasNotebookStand: input.hasNotebookStand,
      hasNotebook: input.hasNotebook,
      hasDesktop: input.hasDesktop,
      termAttached: input.termAttached,
      termFileName: input.termFileName,
      termFileData: input.termFileData,
      regDate: input.regDate
    };
    const phoneDetail = input.hasPhone ? {
      chipNumber: input.phoneChip || null,
      imei: input.phoneIMEI || null,
      pulsusId: input.phonePulsusID || null
    } : void 0;
    const notebookDetail = input.hasNotebook ? {
      serialNumber: input.notebookSerialNumber || null,
      hostname: input.notebookHostname || null
    } : void 0;
    const desktopDetail = input.hasDesktop ? {
      serialNumber: input.desktopSerialNumber || null,
      hostname: input.desktopHostname || null
    } : void 0;
    return await createInventoryRecord(
      recordData,
      phoneDetail,
      notebookDetail,
      desktopDetail
    );
  }),
  update: publicProcedure.input(
    z2.object({
      id: z2.number(),
      userName: z2.string().min(1).optional(),
      userRole: z2.string().min(1).optional(),
      location: z2.string().min(1).optional(),
      manager: z2.string().min(1).optional(),
      emailLicense: z2.enum(["E1", "E3"]).optional(),
      hasPhone: z2.boolean().optional(),
      hasMonitor: z2.boolean().optional(),
      hasMouse: z2.boolean().optional(),
      hasKeyboard: z2.boolean().optional(),
      hasHeadset: z2.boolean().optional(),
      hasNotebookStand: z2.boolean().optional(),
      hasNotebook: z2.boolean().optional(),
      hasDesktop: z2.boolean().optional(),
      termAttached: z2.boolean().optional(),
      termFileName: z2.string().optional(),
      termFileData: z2.string().optional(),
      regDate: z2.string().optional(),
      // Phone details
      phoneChip: z2.string().optional(),
      phoneIMEI: z2.string().optional(),
      phonePulsusID: z2.string().optional(),
      // Notebook details
      notebookSerialNumber: z2.string().optional(),
      notebookHostname: z2.string().optional(),
      // Desktop details
      desktopSerialNumber: z2.string().optional(),
      desktopHostname: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...rest } = input;
    const recordData = {};
    const phoneDetail = {};
    const notebookDetail = {};
    const desktopDetail = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith("phone")) {
        if (key === "phoneChip") phoneDetail.chipNumber = value;
        else if (key === "phoneIMEI") phoneDetail.imei = value;
        else if (key === "phonePulsusID") phoneDetail.pulsusId = value;
      } else if (key.startsWith("notebook")) {
        if (key === "notebookSerialNumber") notebookDetail.serialNumber = value;
        else if (key === "notebookHostname") notebookDetail.hostname = value;
      } else if (key.startsWith("desktop")) {
        if (key === "desktopSerialNumber") desktopDetail.serialNumber = value;
        else if (key === "desktopHostname") desktopDetail.hostname = value;
      } else {
        recordData[key] = value;
      }
    }
    return await updateInventoryRecord(
      id,
      recordData,
      Object.keys(phoneDetail).length > 0 ? phoneDetail : void 0,
      Object.keys(notebookDetail).length > 0 ? notebookDetail : void 0,
      Object.keys(desktopDetail).length > 0 ? desktopDetail : void 0
    );
  }),
  delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    return await deleteInventoryRecord(input.id);
  }),
  // Available Resources
  listResources: publicProcedure.query(async () => {
    return await getAvailableResources();
  }),
  addResource: publicProcedure.input(
    z2.object({
      resourceType: z2.enum([
        "notebook",
        "monitor",
        "headset",
        "phone",
        "desktop",
        "mouse",
        "keyboard",
        "notebookStand"
      ]),
      quantity: z2.number().min(0)
    })
  ).mutation(async ({ input }) => {
    return await addAvailableResource(input.resourceType, input.quantity);
  }),
  deleteResource: publicProcedure.input(
    z2.object({
      id: z2.number()
    })
  ).mutation(async ({ input }) => {
    return await deleteAvailableResource(input.id);
  }),
  // License History
  getHistory: publicProcedure.query(async () => {
    return await getLicenseHistory();
  }),
  getHistoryByType: publicProcedure.input(z2.object({ licenseType: z2.enum(["E1", "E3"]) })).query(async ({ input }) => {
    return await getLicenseHistoryByType(input.licenseType);
  }),
  transferLicense: publicProcedure.input(
    z2.object({
      inventoryId: z2.number(),
      newUserName: z2.string().min(1),
      newLicenseType: z2.enum(["E1", "E3"])
    })
  ).mutation(async ({ input }) => {
    return await transferLicense(
      input.inventoryId,
      input.newUserName,
      input.newLicenseType
    );
  })
});

// server/systemsRouter.ts
import { z as z3 } from "zod";
init_systems();
var systemsRouter = router({
  // Systems Management
  listSystems: publicProcedure.query(async () => {
    return await getAllSystems();
  }),
  getSystem: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    return await getSystemById(input.id);
  }),
  createSystem: publicProcedure.input(
    z3.object({
      name: z3.string().min(1),
      description: z3.string().optional(),
      category: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await createSystem({
      name: input.name,
      description: input.description,
      category: input.category
    });
  }),
  updateSystem: publicProcedure.input(
    z3.object({
      id: z3.number(),
      name: z3.string().min(1).optional(),
      description: z3.string().optional(),
      category: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await updateSystem(input.id, {
      name: input.name,
      description: input.description,
      category: input.category
    });
  }),
  deleteSystem: publicProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    return await deleteSystem(input.id);
  }),
  // Access Profiles
  getAccessProfiles: publicProcedure.input(z3.object({ systemId: z3.number() })).query(async ({ input }) => {
    return await getAccessProfilesBySystem(input.systemId);
  }),
  createAccessProfile: publicProcedure.input(
    z3.object({
      systemId: z3.number(),
      name: z3.string().min(1),
      description: z3.string().optional(),
      permissions: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await createAccessProfile({
      systemId: input.systemId,
      name: input.name,
      description: input.description,
      permissions: input.permissions
    });
  }),
  updateAccessProfile: publicProcedure.input(
    z3.object({
      id: z3.number(),
      name: z3.string().min(1).optional(),
      description: z3.string().optional(),
      permissions: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await updateAccessProfile(input.id, {
      name: input.name,
      description: input.description,
      permissions: input.permissions
    });
  }),
  deleteAccessProfile: publicProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    return await deleteAccessProfile(input.id);
  }),
  // Collaborator System Access
  getCollaboratorAccess: publicProcedure.input(z3.object({ inventoryRecordId: z3.number() })).query(async ({ input }) => {
    return await getCollaboratorSystemAccessWithDetails(input.inventoryRecordId);
  }),
  addSystemAccess: publicProcedure.input(
    z3.object({
      inventoryRecordId: z3.number(),
      systemId: z3.number(),
      accessProfileId: z3.number(),
      notes: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await addSystemAccessToCollaborator({
      inventoryRecordId: input.inventoryRecordId,
      systemId: input.systemId,
      accessProfileId: input.accessProfileId,
      notes: input.notes,
      grantedAt: /* @__PURE__ */ new Date()
    });
  }),
  updateSystemAccess: publicProcedure.input(
    z3.object({
      accessId: z3.number(),
      accessProfileId: z3.number(),
      notes: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await updateSystemAccess(
      input.accessId,
      input.accessProfileId,
      input.notes
    );
  }),
  removeSystemAccess: publicProcedure.input(z3.object({ accessId: z3.number() })).mutation(async ({ input }) => {
    return await removeSystemAccessFromCollaborator(input.accessId);
  }),
  getCollaboratorsWithAccess: publicProcedure.input(z3.object({ systemId: z3.number() })).query(async ({ input }) => {
    return await getCollaboratorsWithSystemAccess(input.systemId);
  }),
  // Statistics
  getStatistics: publicProcedure.query(async () => {
    return await getSystemsStatistics();
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  inventory: inventoryRouter,
  systems: systemsRouter
});

// server/_core/context.ts
async function createContext(opts) {
  return {
    req: opts.req,
    res: opts.res,
    user: {
      id: "admin",
      name: "Administrador",
      role: "admin"
    }
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  app.post("/api/export-pdf/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      if (isNaN(recordId)) {
        res.status(400).setHeader("Content-Type", "application/json").json({ error: "ID invalido" });
        return;
      }
      const { getInventoryRecordById: getInventoryRecordById2 } = await Promise.resolve().then(() => (init_inventory(), inventory_exports));
      const { getCollaboratorSystemAccessWithDetails: getCollaboratorSystemAccessWithDetails2 } = await Promise.resolve().then(() => (init_systems(), systems_exports));
      const { generateUserInventoryPDF: generateUserInventoryPDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const record = await getInventoryRecordById2(recordId);
      if (!record) {
        res.status(404).setHeader("Content-Type", "application/json").json({ error: "Registro nao encontrado" });
        return;
      }
      const systemAccess = await getCollaboratorSystemAccessWithDetails2(recordId);
      const pdfBuffer = await generateUserInventoryPDF2(record, systemAccess);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${record.userName}_inventario.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      res.status(500).setHeader("Content-Type", "application/json").json({ error: "Erro ao gerar PDF" });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 4e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
