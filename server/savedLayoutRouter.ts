import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getDb } from "./db";
import { savedLayouts } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const savedLayoutRouter = router({
  // Listar layouts salvos de um projeto
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const layouts = await dbInstance
        .select()
        .from(savedLayouts)
        .where(
          and(
            eq(savedLayouts.projectId, input.projectId),
            eq(savedLayouts.isActive, 1)
          )
        )
        .orderBy(desc(savedLayouts.createdAt));

      return layouts;
    }),

  // Criar novo layout salvo
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        offsetX: z.number(),
        offsetY: z.number(),
        rotation: z.number(),
        scale: z.number(),
        isValid: z.boolean(),
        validationNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const result = await dbInstance.insert(savedLayouts).values({
        projectId: input.projectId,
        name: input.name,
        description: input.description || null,
        offsetX: input.offsetX,
        offsetY: input.offsetY,
        rotation: input.rotation,
        scale: input.scale,
        isValid: input.isValid ? 1 : 0,
        validationNotes: input.validationNotes || null,
      });

      return { id: Number((result as any).insertId), success: true };
    }),

  // Carregar layout salvo (aplicar ao projeto)
  load: protectedProcedure
    .input(z.object({ layoutId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const layouts = await dbInstance
        .select()
        .from(savedLayouts)
        .where(eq(savedLayouts.id, input.layoutId))
        .limit(1);

      if (layouts.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Layout não encontrado" });
      }

      const layout = layouts[0];
      const project = await db.getProjectById(layout.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      return {
        offsetX: layout.offsetX,
        offsetY: layout.offsetY,
        rotation: layout.rotation,
        scale: layout.scale,
      };
    }),

  // Deletar layout salvo
  delete: protectedProcedure
    .input(z.object({ layoutId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const layouts = await dbInstance
        .select()
        .from(savedLayouts)
        .where(eq(savedLayouts.id, input.layoutId))
        .limit(1);

      if (layouts.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Layout não encontrado" });
      }

      const layout = layouts[0];
      const project = await db.getProjectById(layout.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Soft delete
      await dbInstance
        .update(savedLayouts)
        .set({ isActive: 0 })
        .where(eq(savedLayouts.id, input.layoutId));

      return { success: true };
    }),

  // Obter detalhes de um layout
  get: protectedProcedure
    .input(z.object({ layoutId: z.number() }))
    .query(async ({ input, ctx }) => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const layouts = await dbInstance
        .select()
        .from(savedLayouts)
        .where(eq(savedLayouts.id, input.layoutId))
        .limit(1);

      if (layouts.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Layout não encontrado" });
      }

      const layout = layouts[0];
      const project = await db.getProjectById(layout.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      return layout;
    }),
});
