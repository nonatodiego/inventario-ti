import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createInventoryRecord,
  getAllInventoryRecords,
  getInventoryRecordById,
  updateInventoryRecord,
  deleteInventoryRecord,
  getAvailableResources,
  upsertAvailableResource,
  deleteAvailableResource,
} from "./inventory";

export const inventoryRouter = router({
  // Inventory Records
  list: publicProcedure.query(async () => {
    return await getAllInventoryRecords();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getInventoryRecordById(input.id);
    }),

  create: publicProcedure
    .input(
      z.object({
        userName: z.string().min(1),
        userRole: z.string().min(1),
        location: z.string().min(1),
        manager: z.string().min(1),
        emailLicense: z.enum(["E1", "E3"]),
        hasPhone: z.boolean().default(false),
        hasMonitor: z.boolean().default(false),
        hasMouse: z.boolean().default(false),
        hasKeyboard: z.boolean().default(false),
        hasHeadset: z.boolean().default(false),
        hasNotebookStand: z.boolean().default(false),
        hasNotebook: z.boolean().default(false),
        hasDesktop: z.boolean().default(false),
        termAttached: z.boolean().default(false),
        termFileName: z.string().optional(),
        termFileData: z.string().optional(),
        regDate: z.string(),
        // Phone details
        phoneChip: z.string().optional(),
        phoneIMEI: z.string().optional(),
        phonePulsusID: z.string().optional(),
        // Notebook details
        notebookSerialNumber: z.string().optional(),
        notebookHostname: z.string().optional(),
        // Desktop details
        desktopSerialNumber: z.string().optional(),
        desktopHostname: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
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
        regDate: input.regDate,
      };

      const phoneDetail =
        input.hasPhone && (input.phoneChip || input.phoneIMEI || input.phonePulsusID)
          ? {
              chipNumber: input.phoneChip,
              imei: input.phoneIMEI,
              pulsusId: input.phonePulsusID,
            }
          : undefined;

      const notebookDetail =
        input.hasNotebook && (input.notebookSerialNumber || input.notebookHostname)
          ? {
              serialNumber: input.notebookSerialNumber,
              hostname: input.notebookHostname,
            }
          : undefined;

      const desktopDetail =
        input.hasDesktop && (input.desktopSerialNumber || input.desktopHostname)
          ? {
              serialNumber: input.desktopSerialNumber,
              hostname: input.desktopHostname,
            }
          : undefined;

      return await createInventoryRecord(
        recordData,
        phoneDetail,
        notebookDetail,
        desktopDetail
      );
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        userName: z.string().min(1).optional(),
        userRole: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        manager: z.string().min(1).optional(),
        emailLicense: z.enum(["E1", "E3"]).optional(),
        hasPhone: z.boolean().optional(),
        hasMonitor: z.boolean().optional(),
        hasMouse: z.boolean().optional(),
        hasKeyboard: z.boolean().optional(),
        hasHeadset: z.boolean().optional(),
        hasNotebookStand: z.boolean().optional(),
        hasNotebook: z.boolean().optional(),
        hasDesktop: z.boolean().optional(),
        termAttached: z.boolean().optional(),
        termFileName: z.string().optional(),
        termFileData: z.string().optional(),
        regDate: z.string().optional(),
        // Phone details
        phoneChip: z.string().optional(),
        phoneIMEI: z.string().optional(),
        phonePulsusID: z.string().optional(),
        // Notebook details
        notebookSerialNumber: z.string().optional(),
        notebookHostname: z.string().optional(),
        // Desktop details
        desktopSerialNumber: z.string().optional(),
        desktopHostname: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      const recordData: Record<string, any> = {};
      const phoneDetail: Record<string, any> = {};
      const notebookDetail: Record<string, any> = {};
      const desktopDetail: Record<string, any> = {};

      // Separate data by type
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
        Object.keys(phoneDetail).length > 0 ? phoneDetail : undefined,
        Object.keys(notebookDetail).length > 0 ? notebookDetail : undefined,
        Object.keys(desktopDetail).length > 0 ? desktopDetail : undefined
      );
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteInventoryRecord(input.id);
    }),

  // Available Resources
  listResources: publicProcedure.query(async () => {
    return await getAvailableResources();
  }),

  addResource: publicProcedure
    .input(
      z.object({
        resourceType: z.enum([
          "notebook",
          "monitor",
          "headset",
          "phone",
          "desktop",
          "mouse",
          "keyboard",
          "notebookStand",
        ]),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      return await upsertAvailableResource(input.resourceType, input.quantity);
    }),

  deleteResource: publicProcedure
    .input(
      z.object({
        resourceType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteAvailableResource(input.resourceType);
    }),
});

export type InventoryRouter = typeof inventoryRouter;
