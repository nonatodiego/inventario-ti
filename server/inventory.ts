import {
  inventoryRecords, 
  phoneDetails, 
  notebookDetails, 
  desktopDetails,
  availableResources,
  licenseHistory,
  InsertInventoryRecord,
  InsertPhoneDetail,
  InsertNotebookDetail,
  InsertDesktopDetail,
  InsertAvailableResource,
  InsertLicenseHistory,
} from "../drizzle/schema";
import { getDb, persistDatabase } from "./db";
import { eq, desc } from "drizzle-orm";

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
    await db.insert(inventoryRecords).values(record);
    
    // Get the last inserted record ID
    const inserted = await db.select().from(inventoryRecords).orderBy(desc(inventoryRecords.id)).limit(1);
    const recordId = inserted[0]?.id;
    
    if (!recordId) {
      throw new Error("Failed to retrieve inserted record ID");
    }
    
    console.log('[createInventoryRecord] Created record with ID:', recordId);

    // Always create detail rows if the resource is marked as present, even with empty fields
    if (record.hasPhone) {
      await db.insert(phoneDetails).values({
        chipNumber: phoneDetail?.chipNumber || null,
        imei: phoneDetail?.imei || null,
        pulsusId: phoneDetail?.pulsusId || null,
        inventoryRecordId: recordId,
      } as any);
    }

    if (record.hasNotebook) {
      await db.insert(notebookDetails).values({
        serialNumber: notebookDetail?.serialNumber || null,
        hostname: notebookDetail?.hostname || null,
        inventoryRecordId: recordId,
      } as any);
    }

    if (record.hasDesktop) {
      await db.insert(desktopDetails).values({
        serialNumber: desktopDetail?.serialNumber || null,
        hostname: desktopDetail?.hostname || null,
        inventoryRecordId: recordId,
      } as any);
    }

    // Ensure persistence
    await persistDatabase();
    // Return the full record with details
    return await getInventoryRecordById(recordId);
  } catch (error) {
    console.error("[Database] Failed to create inventory record:", error);
    throw error;
  }
}

/**
 * Get all inventory records with details
 */
export async function getAllInventoryRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const allRecords = await db.select().from(inventoryRecords);
    console.log('[getAllInventoryRecords] Found', allRecords.length, 'records');
    
    const recordsWithDetails = await Promise.all(
      allRecords.map(async (record) => {
        const phone = await db.select().from(phoneDetails).where(eq(phoneDetails.inventoryRecordId, record.id)).limit(1);
        const notebook = await db.select().from(notebookDetails).where(eq(notebookDetails.inventoryRecordId, record.id)).limit(1);
        const desktop = await db.select().from(desktopDetails).where(eq(desktopDetails.inventoryRecordId, record.id)).limit(1);
        
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
          desktopHostname: desktop[0]?.hostname || null,
        };
        
        console.log(`[getAllInventoryRecords] Record ${record.id}: phone=${phone.length}, notebook=${notebook.length}, desktop=${desktop.length}`);
        
        return result;
      })
    );
    
    console.log('[getAllInventoryRecords] Returning', recordsWithDetails.length, 'records with details');
    return recordsWithDetails;
  } catch (error) {
    console.error("[Database] Failed to get inventory records:", error);
    return [];
  }
}

/**
 * Get a single inventory record by ID with details
 */
export async function getInventoryRecordById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const record = await db.select().from(inventoryRecords).where(eq(inventoryRecords.id, id)).limit(1);
    
    if (!record[0]) {
      return null;
    }

    const phone = await db.select().from(phoneDetails).where(eq(phoneDetails.inventoryRecordId, id)).limit(1);
    const notebook = await db.select().from(notebookDetails).where(eq(notebookDetails.inventoryRecordId, id)).limit(1);
    const desktop = await db.select().from(desktopDetails).where(eq(desktopDetails.inventoryRecordId, id)).limit(1);
    
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
      desktopHostname: desktop[0]?.hostname || null,
    };
  } catch (error) {
    console.error("[Database] Failed to get inventory record by ID:", error);
    return null;
  }
}

/**
 * Update an inventory record with resource details
 */
export async function updateInventoryRecord(
  id: number,
  record: Partial<InsertInventoryRecord>,
  phoneDetail?: Omit<InsertPhoneDetail, 'inventoryRecordId'>,
  notebookDetail?: Omit<InsertNotebookDetail, 'inventoryRecordId'>,
  desktopDetail?: Omit<InsertDesktopDetail, 'inventoryRecordId'>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update main record
    await db.update(inventoryRecords).set({ ...record, updatedAt: new Date() }).where(eq(inventoryRecords.id, id));

    // Update or create phone details
    if (record.hasPhone) {
      const existingPhone = await db.select().from(phoneDetails).where(eq(phoneDetails.inventoryRecordId, id)).limit(1);
      if (existingPhone[0]) {
        await db.update(phoneDetails).set({
          chipNumber: phoneDetail?.chipNumber || null,
          imei: phoneDetail?.imei || null,
          pulsusId: phoneDetail?.pulsusId || null,
          updatedAt: new Date(),
        }).where(eq(phoneDetails.inventoryRecordId, id));
      } else {
        await db.insert(phoneDetails).values({
          chipNumber: phoneDetail?.chipNumber || null,
          imei: phoneDetail?.imei || null,
          pulsusId: phoneDetail?.pulsusId || null,
          inventoryRecordId: id,
        } as any);
      }
    }

    // Update or create notebook details
    if (record.hasNotebook) {
      const existingNotebook = await db.select().from(notebookDetails).where(eq(notebookDetails.inventoryRecordId, id)).limit(1);
      if (existingNotebook[0]) {
        await db.update(notebookDetails).set({
          serialNumber: notebookDetail?.serialNumber || null,
          hostname: notebookDetail?.hostname || null,
          updatedAt: new Date(),
        }).where(eq(notebookDetails.inventoryRecordId, id));
      } else {
        await db.insert(notebookDetails).values({
          serialNumber: notebookDetail?.serialNumber || null,
          hostname: notebookDetail?.hostname || null,
          inventoryRecordId: id,
        } as any);
      }
    }

    // Update or create desktop details
    if (record.hasDesktop) {
      const existingDesktop = await db.select().from(desktopDetails).where(eq(desktopDetails.inventoryRecordId, id)).limit(1);
      if (existingDesktop[0]) {
        await db.update(desktopDetails).set({
          serialNumber: desktopDetail?.serialNumber || null,
          hostname: desktopDetail?.hostname || null,
          updatedAt: new Date(),
        }).where(eq(desktopDetails.inventoryRecordId, id));
      } else {
        await db.insert(desktopDetails).values({
          serialNumber: desktopDetail?.serialNumber || null,
          hostname: desktopDetail?.hostname || null,
          inventoryRecordId: id,
        } as any);
      }
    }

    // Ensure persistence
    await persistDatabase();
    return id;
  } catch (error) {
    console.error("[Database] Failed to update inventory record:", error);
    throw error;
  }
}

/**
 * Delete an inventory record
 */
export async function deleteInventoryRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Delete related details first
    await db.delete(phoneDetails).where(eq(phoneDetails.inventoryRecordId, id));
    await db.delete(notebookDetails).where(eq(notebookDetails.inventoryRecordId, id));
    await db.delete(desktopDetails).where(eq(desktopDetails.inventoryRecordId, id));
    
    // Then delete the main record
    await db.delete(inventoryRecords).where(eq(inventoryRecords.id, id));
    // Ensure persistence
    await persistDatabase();
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
    return await db.select().from(availableResources);
  } catch (error) {
    console.error("[Database] Failed to get available resources:", error);
    return [];
  }
}

/**
 * Add available resource
 */
export async function addAvailableResource(resourceType: "notebook" | "monitor" | "headset" | "phone" | "desktop" | "mouse" | "keyboard" | "notebookStand", quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(availableResources).values({
      resourceType,
      quantity,
    });
    // Ensure persistence
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to add available resource:", error);
    throw error;
  }
}

/**
 * Delete available resource
 */
export async function deleteAvailableResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(availableResources).where(eq(availableResources.id, id));
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete available resource:", error);
    throw error;
  }
}

/**
 * Create license history entry (append-only)
 * This function is called automatically when licenses are transferred
 */
export async function createLicenseHistory(
  licenseType: "E1" | "E3",
  fromUser: string | null,
  toUser: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(licenseHistory).values({
      licenseType,
      fromUser: fromUser || null,
      toUser: toUser || null,
      createdAt: new Date(),
    });
    // Ensure persistence
    await persistDatabase();
    console.log(`[License History] ${fromUser || 'AVAILABLE'} → ${toUser || 'AVAILABLE'} (${licenseType})`);
  } catch (error) {
    console.error("[Database] Failed to create license history:", error);
    throw error;
  }
}

/**
 * Get all license history entries
 */
export async function getLicenseHistory() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const history = await db
      .select()
      .from(licenseHistory)
      .orderBy(desc(licenseHistory.createdAt));
    
    return history;
  } catch (error) {
    console.error("[Database] Failed to get license history:", error);
    return [];
  }
}

/**
 * Get license history for a specific license type
 */
export async function getLicenseHistoryByType(licenseType: "E1" | "E3") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const history = await db
      .select()
      .from(licenseHistory)
      .where(eq(licenseHistory.licenseType, licenseType))
      .orderBy(desc(licenseHistory.createdAt));
    
    return history;
  } catch (error) {
    console.error("[Database] Failed to get license history by type:", error);
    return [];
  }
}

/**
 * Transfer license between users
 * Automatically creates history entry
 */
export async function transferLicense(
  inventoryId: number,
  newUserName: string,
  newLicenseType: "E1" | "E3"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current record
    const currentRecords = await db
      .select()
      .from(inventoryRecords)
      .where(eq(inventoryRecords.id, inventoryId));
    
    const currentRecord = currentRecords[0];
    if (!currentRecord) {
      throw new Error(`Inventory record ${inventoryId} not found`);
    }

    // Detect changes
    const userChanged = currentRecord.userName !== newUserName;
    const licenseChanged = currentRecord.emailLicense !== newLicenseType;

    // Create history entry if there are changes
    if (userChanged || licenseChanged) {
      await createLicenseHistory(
        newLicenseType,
        currentRecord.userName,
        newUserName
      );
    }

    // Update inventory record
    await db
      .update(inventoryRecords)
      .set({
        userName: newUserName,
        emailLicense: newLicenseType,
        updatedAt: new Date(),
      })
      .where(eq(inventoryRecords.id, inventoryId));

    console.log(`[Transfer] License transferred: ${currentRecord.userName} → ${newUserName}`);
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to transfer license:", error);
    throw error;
  }
}
