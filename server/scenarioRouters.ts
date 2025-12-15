import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const scenarioRouter = router({
  // Listar todos os cenários de um projeto
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return await db.getScenariosByProjectId(input.projectId);
    }),

  // Criar novo cenário
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        polygonCoordinates: z.string(),
        area: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createScenario({
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        polygonCoordinates: input.polygonCoordinates,
        area: input.area,
        isActive: 0,
      });
      return { success: true };
    }),

  // Atualizar cenário
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        polygonCoordinates: z.string().optional(),
        area: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateScenario(id, data);
      return { success: true };
    }),

  // Deletar cenário
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteScenario(input.id);
      return { success: true };
    }),

  // Ativar cenário
  setActive: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        scenarioId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.setActiveScenario(input.projectId, input.scenarioId);
      return { success: true };
    }),

  // Obter cenário por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getScenarioById(input.id);
    }),
});
