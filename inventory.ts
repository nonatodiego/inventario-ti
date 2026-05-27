import { eq, and } from "drizzle-orm";
import { 
  inventoryRecords, 
  phoneDetails, 
  notebookDetails, 
  desktopDetails,
  availableResources,
  InsertInventoryRecord,
  InsertPhoneDetail,
  InsertNotebookDetail,
  InsertDesktopDetail,
  InsertAvailableResource,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new inventory record with resource details
 */
export async function createInventoryRecord(
  record: InsertInventoryRecord,
  phoneDetail?: Omit<InsertPhoneDetail, 'inventoryRecordId'>,
  notebookDetail?: Omit<InsertNotebookDetail, 'inventoryRecordId'>,
  desktopDetail?: Omit<InsertDesktopDetail, 'inventoryRecordId'>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Insert inventory record
    const result = await db.insert(inventoryRecords).values(record);
    const recordId = (result as any).insertId;

    // Insert phone details if provided
    if (phoneDetail && recordId) {
      await db.insert(phoneDetails).values({
        ...phoneDetail,
        inventoryRecordId: recordId,
      } as any);
    }

    // Insert notebook details if provided
    if (notebookDetail && recordId) {
      await db.insert(notebookDetails).values({
        ...notebookDetail,
        inventoryRecordId: recordId,
      } as any);
    }

    // Insert desktop details if provided
    if (desktopDetail && recordId) {
      await db.insert(desktopDetails).values({
        ...desktopDetail,
        inventoryRecordId: recordId,
      } as any);
    }

    return recordId;
  } catch (error) {
    console.error("[Database] Failed to create inventory record:", error);
    throw error;
  }
}

/**
 * Get all inventory records
 */
export async function getAllInventoryRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const records = await db.select().from(inventoryRecords);
    return records;
  } catch (error) {
    console.error("[Database] Failed to get inventory records:", error);
    throw error;
  }
}

/**
 * Get inventory record by ID with all details
 */
export async function getInventoryRecordById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const record = await db
      .select()
      .from(inventoryRecords)
      .where(eq(inventoryRecords.id, id))
      .limit(1);

    if (!record.length) return null;

    // Get related details
    const phone = record[0].hasPhone
      ? await db
          .select()
          .from(phoneDetails)
          .where(eq(phoneDetails.inventoryRecordId, id))
          .limit(1)
      : [];

    const notebook = record[0].hasNotebook
      ? await db
          .select()
          .from(notebookDetails)
          .where(eq(notebookDetails.inventoryRecordId, id))
          .limit(1)
      : [];

    const desktop = record[0].hasDesktop
      ? await db
          .select()
          .from(desktopDetails)
          .where(eq(desktopDetails.inventoryRecordId, id))
          .limit(1)
      : [];

    return {
      ...record[0],
      phoneDetail: phone[0] || null,
      notebookDetail: notebook[0] || null,
      desktopDetail: desktop[0] || null,
    };
  } catch (error) {
    console.error("[Database] Failed to get inventory record:", error);
    throw error;
  }
}

/**
 * Update inventory record
 */
export async function updateInventoryRecord(
  id: number,
  record: Partial<InsertInventoryRecord>,
  phoneDetail?: Partial<InsertPhoneDetail>,
  notebookDetail?: Partial<InsertNotebookDetail>,
  desktopDetail?: Partial<InsertDesktopDetail>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update main record
    await db
      .update(inventoryRecords)
      .set(record)
      .where(eq(inventoryRecords.id, id));

    // Update or insert phone details
    if (phoneDetail) {
      const existing = await db
        .select()
        .from(phoneDetails)
        .where(eq(phoneDetails.inventoryRecordId, id))
        .limit(1);

      if (existing.length) {
        await db
          .update(phoneDetails)
          .set(phoneDetail)
          .where(eq(phoneDetails.inventoryRecordId, id));
      } else {
        await db.insert(phoneDetails).values({
          ...phoneDetail,
          inventoryRecordId: id,
        });
      }
    }

    // Update or insert notebook details
    if (notebookDetail) {
      const existing = await db
        .select()
        .from(notebookDetails)
        .where(eq(notebookDetails.inventoryRecordId, id))
        .limit(1);

      if (existing.length) {
        await db
          .update(notebookDetails)
          .set(notebookDetail)
          .where(eq(notebookDetails.inventoryRecordId, id));
      } else {
        await db.insert(notebookDetails).values({
          ...notebookDetail,
          inventoryRecordId: id,
        });
      }
    }

    // Update or insert desktop details
    if (desktopDetail) {
      const existing = await db
        .select()
        .from(desktopDetails)
        .where(eq(desktopDetails.inventoryRecordId, id))
        .limit(1);

      if (existing.length) {
        await db
          .update(desktopDetails)
          .set(desktopDetail)
          .where(eq(desktopDetails.inventoryRecordId, id));
      } else {
        await db.insert(desktopDetails).values({
          ...desktopDetail,
          inventoryRecordId: id,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to update inventory record:", error);
    throw error;
  }
}

/**
 * Delete inventory record
 */
export async function deleteInventoryRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Delete related details first
    await db.delete(phoneDetails).where(eq(phoneDetails.inventoryRecordId, id));
    await db.delete(notebookDetails).where(eq(notebookDetails.inventoryRecordId, id));
    await db.delete(desktopDetails).where(eq(desktopDetails.inventoryRecordId, id));

    // Delete main record
    await db.delete(inventoryRecords).where(eq(inventoryRecords.id, id));

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete inventory record:", error);
    throw error;
  }
}

/**
 * Get available resources
 */
export async function getAvailableResources() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const resources = await db.select().from(availableResources);
    return resources;
  } catch (error) {
    console.error("[Database] Failed to get available resources:", error);
    throw error;
  }
}

/**
 * Add or update available resource
 */
export async function upsertAvailableResource(
  resourceType: string,
  quantity: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await db
      .select()
      .from(availableResources)
      .where(eq(availableResources.resourceType, resourceType as any))
      .limit(1);

    if (existing.length) {
      await db
        .update(availableResources)
        .set({ quantity })
        .where(eq(availableResources.resourceType, resourceType as any));
    } else {
      await db.insert(availableResources).values({
        resourceType: resourceType as any,
        quantity,
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to upsert available resource:", error);
    throw error;
  }
}

/**
 * Delete available resource
 */
export async function deleteAvailableResource(resourceType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .delete(availableResources)
      .where(eq(availableResources.resourceType, resourceType as any));

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete available resource:", error);
    throw error;
  }
}
