import { describe, it, expect, beforeAll } from "vitest";
import {
  createLicenseHistory,
  getLicenseHistory,
  getLicenseHistoryByType,
  transferLicense,
  createInventoryRecord,
  getInventoryRecordById,
} from "./inventory";

describe("License History", () => {
  let testInventoryId: number;

  beforeAll(async () => {
    // Create a test inventory record
    const result = await createInventoryRecord({
      userName: "João Silva",
      userRole: "Analista",
      location: "RJ",
      manager: "Maria",
      emailLicense: "E3",
      hasPhone: false,
      hasMonitor: false,
      hasMouse: false,
      hasKeyboard: false,
      hasHeadset: false,
      hasNotebookStand: false,
      hasNotebook: false,
      hasDesktop: false,
      termAttached: false,
      regDate: new Date().toISOString().split("T")[0],
    });

    testInventoryId = result?.id || 1;
  });

  it("should create a license history entry", async () => {
    await createLicenseHistory("E3", "João Silva", "Maria Santos");

    const history = await getLicenseHistory();
    expect(history.length).toBeGreaterThan(0);

    const lastEntry = history[0];
    expect(lastEntry.licenseType).toBe("E3");
    expect(lastEntry.fromUser).toBe("João Silva");
    expect(lastEntry.toUser).toBe("Maria Santos");
  });

  it("should get all license history entries", async () => {
    await createLicenseHistory("E1", "Carlos", "Pedro");
    await createLicenseHistory("E3", "Ana", "Beatriz");

    const history = await getLicenseHistory();
    expect(history.length).toBeGreaterThanOrEqual(3);
  });

  it("should filter license history by type", async () => {
    await createLicenseHistory("E1", "User1", "User2");
    await createLicenseHistory("E3", "User3", "User4");

    const e1History = await getLicenseHistoryByType("E1");
    const e3History = await getLicenseHistoryByType("E3");

    expect(e1History.every((h) => h.licenseType === "E1")).toBe(true);
    expect(e3History.every((h) => h.licenseType === "E3")).toBe(true);
  });

  it("should transfer license and create history", async () => {
    // Transfer license
    const result = await transferLicense(testInventoryId, "Nova Pessoa", "E1");
    expect(result).toBe(true);

    // Verify history was created
    const history = await getLicenseHistory();
    const transferEntry = history.find(
      (h) => h.toUser === "Nova Pessoa" && h.licenseType === "E1"
    );

    expect(transferEntry).toBeDefined();
    expect(transferEntry?.fromUser).toBe("João Silva");
    expect(transferEntry?.toUser).toBe("Nova Pessoa");
  });

  it("should handle null fromUser for new assignments", async () => {
    await createLicenseHistory("E3", null, "Novo Usuário");

    const history = await getLicenseHistory();
    const newAssignment = history.find((h) => h.toUser === "Novo Usuário");

    expect(newAssignment).toBeDefined();
    expect(newAssignment?.fromUser).toBeNull();
  });

  it("should handle null toUser for license removals", async () => {
    await createLicenseHistory("E1", "Usuário Antigo", null);

    const history = await getLicenseHistory();
    const removal = history.find((h) => h.fromUser === "Usuário Antigo" && h.toUser === null);

    expect(removal).toBeDefined();
    expect(removal?.toUser).toBeNull();
  });

  it("should maintain append-only integrity", async () => {
    const historyBefore = await getLicenseHistory();
    const countBefore = historyBefore.length;

    await createLicenseHistory("E3", "Test1", "Test2");
    await createLicenseHistory("E1", "Test3", "Test4");

    const historyAfter = await getLicenseHistory();
    const countAfter = historyAfter.length;

    // Verify count increased by 2
    expect(countAfter).toBe(countBefore + 2);

    // Verify both entries exist
    const test4Entry = historyAfter.find((h) => h.toUser === "Test4");
    const test2Entry = historyAfter.find((h) => h.toUser === "Test2");
    expect(test4Entry).toBeDefined();
    expect(test2Entry).toBeDefined();
    
    // Verify data integrity
    expect(test4Entry?.licenseType).toBe("E1");
    expect(test2Entry?.licenseType).toBe("E3");
  });

  it("should detect user changes and create history", async () => {
    const beforeTransfer = await getInventoryRecordById(testInventoryId);
    expect(beforeTransfer?.userName).toBe("Nova Pessoa");

    await transferLicense(testInventoryId, "Outra Pessoa", "E3");

    const afterTransfer = await getInventoryRecordById(testInventoryId);
    expect(afterTransfer?.userName).toBe("Outra Pessoa");

    const history = await getLicenseHistory();
    const changeEntry = history.find((h) => h.toUser === "Outra Pessoa");
    expect(changeEntry).toBeDefined();
  });
});
