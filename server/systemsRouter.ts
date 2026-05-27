import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
  getAccessProfilesBySystem,
  createAccessProfile,
  updateAccessProfile,
  deleteAccessProfile,
  getCollaboratorSystemAccess,
  getCollaboratorSystemAccessWithDetails,
  addSystemAccessToCollaborator,
  updateSystemAccess,
  removeSystemAccessFromCollaborator,
  getCollaboratorsWithSystemAccess,
  getSystemsStatistics,
} from "./systems";

export const systemsRouter = router({
  // Systems Management
  listSystems: publicProcedure.query(async () => {
    return await getAllSystems();
  }),

  getSystem: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getSystemById(input.id);
    }),

  createSystem: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createSystem({
        name: input.name,
        description: input.description,
        category: input.category,
      });
    }),

  updateSystem: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateSystem(input.id, {
        name: input.name,
        description: input.description,
        category: input.category,
      });
    }),

  deleteSystem: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteSystem(input.id);
    }),

  // Access Profiles
  getAccessProfiles: publicProcedure
    .input(z.object({ systemId: z.number() }))
    .query(async ({ input }) => {
      return await getAccessProfilesBySystem(input.systemId);
    }),

  createAccessProfile: publicProcedure
    .input(
      z.object({
        systemId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createAccessProfile({
        systemId: input.systemId,
        name: input.name,
        description: input.description,
        permissions: input.permissions,
      });
    }),

  updateAccessProfile: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        permissions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateAccessProfile(input.id, {
        name: input.name,
        description: input.description,
        permissions: input.permissions,
      });
    }),

  deleteAccessProfile: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteAccessProfile(input.id);
    }),

  // Collaborator System Access
  getCollaboratorAccess: publicProcedure
    .input(z.object({ inventoryRecordId: z.number() }))
    .query(async ({ input }) => {
      return await getCollaboratorSystemAccessWithDetails(input.inventoryRecordId);
    }),

  addSystemAccess: publicProcedure
    .input(
      z.object({
        inventoryRecordId: z.number(),
        systemId: z.number(),
        accessProfileId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await addSystemAccessToCollaborator({
        inventoryRecordId: input.inventoryRecordId,
        systemId: input.systemId,
        accessProfileId: input.accessProfileId,
        notes: input.notes,
        grantedAt: new Date(),
      });
    }),

  updateSystemAccess: publicProcedure
    .input(
      z.object({
        accessId: z.number(),
        accessProfileId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateSystemAccess(
        input.accessId,
        input.accessProfileId,
        input.notes
      );
    }),

  removeSystemAccess: publicProcedure
    .input(z.object({ accessId: z.number() }))
    .mutation(async ({ input }) => {
      return await removeSystemAccessFromCollaborator(input.accessId);
    }),

  getCollaboratorsWithAccess: publicProcedure
    .input(z.object({ systemId: z.number() }))
    .query(async ({ input }) => {
      return await getCollaboratorsWithSystemAccess(input.systemId);
    }),

  // Statistics
  getStatistics: publicProcedure.query(async () => {
    return await getSystemsStatistics();
  }),
});

export type SystemsRouter = typeof systemsRouter;
