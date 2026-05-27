import { describe, it, expect, beforeAll } from "vitest";
import {
  createSystem,
  getAllSystems,
  getSystemById,
  createAccessProfile,
  getAccessProfilesBySystem,
  addSystemAccessToCollaborator,
  getCollaboratorSystemAccess,
  updateSystemAccess,
  removeSystemAccessFromCollaborator,
} from "./systems";
import { createInventoryRecord } from "./inventory";

describe("Systems Management", () => {
  let systemId: number;
  let profileId: number;
  let inventoryId: number;
  let accessId: number;

  beforeAll(async () => {
    // Create test inventory record
    const inventory = await createInventoryRecord({
      userName: "Test User",
      userRole: "Developer",
      location: "Office",
      manager: "Manager Name",
      emailLicense: "E3",
      regDate: new Date().toISOString().split('T')[0],
    });
    if (inventory) {
      inventoryId = inventory.id;
    }
  });

  it("should create a system", async () => {
    const system = await createSystem({
      name: "Jira",
      description: "Project Management",
      category: "Project Management",
    });

    expect(system).toBeDefined();
    expect(system?.name).toBe("Jira");
    expect(system?.category).toBe("Project Management");
    if (system) {
      systemId = system.id;
    }
  });

  it("should get all systems", async () => {
    const systems = await getAllSystems();
    expect(Array.isArray(systems)).toBe(true);
    expect(systems.length).toBeGreaterThan(0);
  });

  it("should get system by ID", async () => {
    const system = await getSystemById(systemId);
    expect(system).toBeDefined();
    expect(system?.id).toBe(systemId);
    expect(system?.name).toBe("Jira");
  });

  it("should create access profile for system", async () => {
    const profile = await createAccessProfile({
      systemId,
      name: "Developer",
      description: "Full access for developers",
      permissions: JSON.stringify({
        create: true,
        read: true,
        update: true,
        delete: false,
      }),
    });

    expect(profile).toBeDefined();
    expect(profile?.name).toBe("Developer");
    expect(profile?.systemId).toBe(systemId);
    if (profile) {
      profileId = profile.id;
    }
  });

  it("should get access profiles by system", async () => {
    const profiles = await getAccessProfilesBySystem(systemId);
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0]?.systemId).toBe(systemId);
  });

  it("should add system access to collaborator", async () => {
    const access = await addSystemAccessToCollaborator({
      inventoryRecordId: inventoryId,
      systemId,
      accessProfileId: profileId,
      notes: "Developer access granted",
      grantedAt: new Date(),
    });

    expect(access).toBeDefined();
    expect(access?.inventoryRecordId).toBe(inventoryId);
    expect(access?.systemId).toBe(systemId);
    expect(access?.accessProfileId).toBe(profileId);
    if (access) {
      accessId = access.id;
    }
  });

  it("should get collaborator system access", async () => {
    const accesses = await getCollaboratorSystemAccess(inventoryId);
    expect(Array.isArray(accesses)).toBe(true);
    expect(accesses.length).toBeGreaterThan(0);
    expect(accesses[0]?.inventoryRecordId).toBe(inventoryId);
  });

  it("should update system access", async () => {
    // Create another profile for update test
    const newProfile = await createAccessProfile({
      systemId,
      name: "Manager",
      description: "Manager access",
    });

    if (newProfile) {
      const result = await updateSystemAccess(
        accessId,
        newProfile.id,
        "Updated to Manager role"
      );
      expect(result).toBe(true);
    }
  });

  it("should remove system access from collaborator", async () => {
    const result = await removeSystemAccessFromCollaborator(accessId);
    expect(result).toBe(true);

    // Verify removal
    const accesses = await getCollaboratorSystemAccess(inventoryId);
    const stillExists = accesses.some((a) => a.id === accessId);
    expect(stillExists).toBe(false);
  });

  it("should handle multiple systems per collaborator", async () => {
    // Create another system
    const system2 = await createSystem({
      name: "Confluence",
      description: "Documentation",
      category: "Documentation",
    });

    if (system2) {
      // Create profile for second system
      const profile2 = await createAccessProfile({
        systemId: system2.id,
        name: "Viewer",
        description: "Read-only access",
      });

      if (profile2) {
        // Add access to both systems
        const access1 = await addSystemAccessToCollaborator({
          inventoryRecordId: inventoryId,
          systemId,
          accessProfileId: profileId,
          grantedAt: new Date(),
        });

        const access2 = await addSystemAccessToCollaborator({
          inventoryRecordId: inventoryId,
          systemId: system2.id,
          accessProfileId: profile2.id,
          grantedAt: new Date(),
        });

        const allAccesses = await getCollaboratorSystemAccess(inventoryId);
        expect(allAccesses.length).toBeGreaterThanOrEqual(2);

        // Cleanup
        if (access1) {
          await removeSystemAccessFromCollaborator(access1.id);
        }
        if (access2) {
          await removeSystemAccessFromCollaborator(access2.id);
        }
      }
    }
  });
});
