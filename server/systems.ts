import {
  systems,
  accessProfiles,
  collaboratorSystemAccess,
  InsertSystem,
  InsertAccessProfile,
  InsertCollaboratorSystemAccess,
} from "../drizzle/schema";
import { getDb, persistDatabase } from "./db";
import { eq, desc } from "drizzle-orm";

/**
 * Get all systems
 */
export async function getAllSystems() {
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

/**
 * Get system by ID
 */
export async function getSystemById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.select().from(systems).where(eq(systems.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get system by ID:", error);
    return null;
  }
}

/**
 * Create a new system
 */
export async function createSystem(data: InsertSystem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(systems).values(data);
    // Ensure persistence
    await persistDatabase();
    const result = await db.select().from(systems).orderBy(desc(systems.id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create system:", error);
    throw error;
  }
}

/**
 * Get all access profiles for a system
 */
export async function getAccessProfilesBySystem(systemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const profiles = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.systemId, systemId))
      .orderBy(accessProfiles.name);
    return profiles;
  } catch (error) {
    console.error("[Database] Failed to get access profiles:", error);
    return [];
  }
}

/**
 * Create access profile for a system
 */
export async function createAccessProfile(data: InsertAccessProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(accessProfiles).values(data);
    // Ensure persistence
    await persistDatabase();
    const result = await db
      .select()
      .from(accessProfiles)
      .orderBy(desc(accessProfiles.id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create access profile:", error);
    throw error;
  }
}

/**
 * Get all system accesses for a collaborator
 */
export async function getCollaboratorSystemAccess(inventoryRecordId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accesses = await db
      .select()
      .from(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.inventoryRecordId, inventoryRecordId))
      .orderBy(desc(collaboratorSystemAccess.createdAt));
    return accesses;
  } catch (error) {
    console.error("[Database] Failed to get collaborator system access:", error);
    return [];
  }
}

/**
 * Get collaborator system access with system and profile details
 */
export async function getCollaboratorSystemAccessWithDetails(inventoryRecordId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accesses = await db
      .select()
      .from(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.inventoryRecordId, inventoryRecordId));

    // Fetch related systems and profiles
    const result = await Promise.all(
      accesses.map(async (access) => {
        const system = await getSystemById(access.systemId);
        const profile = await db
          .select()
          .from(accessProfiles)
          .where(eq(accessProfiles.id, access.accessProfileId))
          .limit(1);

        return {
          ...access,
          system: system,
          profile: profile[0] || null,
        };
      })
    );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get collaborator system access with details:", error);
    return [];
  }
}

/**
 * Add system access to collaborator
 */
export async function addSystemAccessToCollaborator(
  data: InsertCollaboratorSystemAccess
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(collaboratorSystemAccess).values(data);
    // Ensure persistence
    await persistDatabase();
    const result = await db
      .select()
      .from(collaboratorSystemAccess)
      .orderBy(desc(collaboratorSystemAccess.id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to add system access:", error);
    throw error;
  }
}

/**
 * Update system access for collaborator
 */
export async function updateSystemAccess(
  accessId: number,
  accessProfileId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(collaboratorSystemAccess)
      .set({
        accessProfileId,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(collaboratorSystemAccess.id, accessId));
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to update system access:", error);
    throw error;
  }
}

/**
 * Remove system access from collaborator
 */
export async function removeSystemAccessFromCollaborator(accessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .delete(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.id, accessId));
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to remove system access:", error);
    throw error;
  }
}

/**
 * Get all collaborators with access to a specific system
 */
export async function getCollaboratorsWithSystemAccess(systemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accesses = await db
      .select()
      .from(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.systemId, systemId));
    return accesses;
  } catch (error) {
    console.error("[Database] Failed to get collaborators with system access:", error);
    return [];
  }
}


/**
 * Update a system
 */
export async function updateSystem(id: number, data: Partial<InsertSystem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .update(systems)
      .set(data)
      .where(eq(systems.id, id));
    // Ensure persistence
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to update system:", error);
    throw error;
  }
}

/**
 * Delete a system
 */
export async function deleteSystem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Delete all access profiles for this system
    await db
      .delete(accessProfiles)
      .where(eq(accessProfiles.systemId, id));

    // Delete all collaborator system access for this system
    await db
      .delete(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.systemId, id));

    // Delete the system
    await db
      .delete(systems)
      .where(eq(systems.id, id));
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete system:", error);
    throw error;
  }
}

/**
 * Update an access profile
 */
export async function updateAccessProfile(id: number, data: Partial<InsertAccessProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .update(accessProfiles)
      .set(data)
      .where(eq(accessProfiles.id, id));
    // Ensure persistence
    await persistDatabase();
    return result;
  } catch (error) {
    console.error("[Database] Failed to update access profile:", error);
    throw error;
  }
}

/**
 * Delete an access profile
 */
export async function deleteAccessProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Delete all collaborator system access using this profile
    await db
      .delete(collaboratorSystemAccess)
      .where(eq(collaboratorSystemAccess.accessProfileId, id));

    // Delete the profile
    await db
      .delete(accessProfiles)
      .where(eq(accessProfiles.id, id));
    // Ensure persistence
    await persistDatabase();
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete access profile:", error);
    throw error;
  }
}

/**
 * Get statistics for dashboard
 */
export async function getSystemsStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const totalSystems = await db.select().from(systems);
    const totalProfiles = await db.select().from(accessProfiles);
    const totalAccess = await db.select().from(collaboratorSystemAccess);

    return {
      totalSystems: totalSystems.length,
      totalProfiles: totalProfiles.length,
      totalCollaboratorsWithAccess: new Set(totalAccess.map(a => a.inventoryRecordId)).size,
      systemsWithMostAccess: totalSystems.map(system => ({
        systemId: system.id,
        systemName: system.name,
        accessCount: totalAccess.filter(a => a.systemId === system.id).length,
      })).sort((a, b) => b.accessCount - a.accessCount).slice(0, 5),
    };
  } catch (error) {
    console.error("[Database] Failed to get systems statistics:", error);
    return {
      totalSystems: 0,
      totalProfiles: 0,
      totalCollaboratorsWithAccess: 0,
      systemsWithMostAccess: [],
    };
  }
}
