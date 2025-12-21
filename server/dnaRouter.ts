import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getOrGenerateProjectDNA } from "./services/projectDNAHelper";
import { DNA_PRESETS, getPresetById, applyPresetToDNA } from "./services/dnaPresets";
import { getDb } from "./db";
import { projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const dnaRouter = router({
  /**
   * Obter DNA do projeto atual
   */
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const dna = await getOrGenerateProjectDNA(input.projectId);
      
      return {
        dna,
        generated: !!project.dnaGenerated,
      };
    }),

  /**
   * Regenerar DNA do projeto
   * Útil quando dados do projeto mudaram (área, altura, briefing, etc)
   */
  regenerate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      console.log(`[DNA] Regenerating DNA for project ${input.projectId}`);
      
      // Forçar regeneração do DNA
      const dna = await getOrGenerateProjectDNA(input.projectId, true);
      
      console.log(`[DNA] DNA regenerated successfully:`, {
        buildingShape: dna.buildingShape,
        style: dna.style,
        primaryColor: dna.primaryColor,
        accentColor: dna.accentColor,
      });
      
      return {
        success: true,
        dna,
        message: "DNA do projeto regenerado com sucesso! Todos os próximos estudos usarão esta nova identidade visual.",
      };
    }),

  /**
   * Listar presets de DNA disponíveis
   */
  listPresets: protectedProcedure.query(() => {
    return DNA_PRESETS.map((preset) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: preset.category,
      thumbnail: preset.thumbnail,
    }));
  }),

  /**
   * Aplicar preset de DNA ao projeto
   */
  applyPreset: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        presetId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Buscar preset
      const preset = getPresetById(input.presetId);
      if (!preset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset não encontrado" });
      }

      console.log(`[DNA] Applying preset "${preset.name}" to project ${input.projectId}`);

      // Obter DNA atual (para manter volumetria)
      const currentDNA = await getOrGenerateProjectDNA(input.projectId);

      // Aplicar preset mantendo volumetria original
      const newDNA = applyPresetToDNA(currentDNA, preset);

      // Salvar no banco de dados
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      await database
        .update(projects)
        .set({
          dnaGenerated: 1,
          dnaBuildingShape: newDNA.buildingShape,
          dnaStyle: newDNA.style,
          dnaFeatures: JSON.stringify(newDNA.features),
          dnaPrimaryColor: newDNA.primaryColor,
          dnaAccentColor: newDNA.accentColor,
          dnaMaterials: JSON.stringify(newDNA.materials),
          dnaLandscaping: newDNA.landscaping,
          dnaLayout: newDNA.layout,
          dnaContext: newDNA.context,
        })
        .where(eq(projects.id, input.projectId));

      console.log(`[DNA] Preset "${preset.name}" applied successfully`);

      return {
        success: true,
        dna: newDNA,
        message: `Estilo "${preset.name}" aplicado com sucesso! Todos os próximos estudos usarão esta identidade visual.`,
      };
    }),
});
