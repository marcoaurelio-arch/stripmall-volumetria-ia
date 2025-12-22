import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getOrGenerateProjectDNA } from "./services/projectDNAHelper";
import { DNA_PRESETS, getPresetById, applyPresetToDNA } from "./services/dnaPresets";
import { validateDNAConsistency, formatValidationReport } from "./services/dnaConsistencyValidator";
import { getDb } from "./db";
import { projects, dnaHistory } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

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
      
      // Validar consistência do DNA gerado
      const validation = validateDNAConsistency(dna);
      console.log(`[DNA] Validation result:`, validation);
      
      if (!validation.isValid) {
        console.warn(`[DNA] DNA validation failed:`, validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn(`[DNA] DNA validation warnings:`, validation.warnings);
      }
      
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

      // Salvar no histórico
      await database.insert(dnaHistory).values({
        projectId: input.projectId,
        presetId: preset.id,
        presetName: preset.name,
        dnaBuildingShape: newDNA.buildingShape,
        dnaStyle: newDNA.style,
        dnaFeatures: JSON.stringify(newDNA.features),
        dnaPrimaryColor: newDNA.primaryColor,
        dnaAccentColor: newDNA.accentColor,
        dnaMaterials: JSON.stringify(newDNA.materials),
        dnaLandscaping: newDNA.landscaping,
        dnaLayout: newDNA.layout,
        dnaContext: newDNA.context,
        changeType: "preset_applied",
        appliedBy: ctx.user.id,
      });

      console.log(`[DNA] Preset "${preset.name}" applied successfully and saved to history`);

      return {
        success: true,
        dna: newDNA,
        message: `Estilo "${preset.name}" aplicado com sucesso! Todos os próximos estudos usarão esta identidade visual.`,
      };
    }),

  /**
   * Listar histórico de estilos aplicados ao projeto
   */
  listHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const history = await database
        .select()
        .from(dnaHistory)
        .where(eq(dnaHistory.projectId, input.projectId))
        .orderBy(desc(dnaHistory.appliedAt));

      return history;
    }),

  /**
   * Reverter para um estilo anterior do histórico
   */
  revertToHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        historyId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Buscar entrada do histórico
      const historyEntry = await database
        .select()
        .from(dnaHistory)
        .where(eq(dnaHistory.id, input.historyId))
        .limit(1);

      if (historyEntry.length === 0 || historyEntry[0].projectId !== input.projectId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entrada de histórico não encontrada" });
      }

      const entry = historyEntry[0];

      console.log(`[DNA] Reverting project ${input.projectId} to history entry ${input.historyId}`);

      // Restaurar DNA do histórico
      await database
        .update(projects)
        .set({
          dnaGenerated: 1,
          dnaBuildingShape: entry.dnaBuildingShape,
          dnaStyle: entry.dnaStyle,
          dnaFeatures: entry.dnaFeatures,
          dnaPrimaryColor: entry.dnaPrimaryColor,
          dnaAccentColor: entry.dnaAccentColor,
          dnaMaterials: entry.dnaMaterials,
          dnaLandscaping: entry.dnaLandscaping,
          dnaLayout: entry.dnaLayout,
          dnaContext: entry.dnaContext,
        })
        .where(eq(projects.id, input.projectId));

      // Criar nova entrada no histórico para a reversão
      await database.insert(dnaHistory).values({
        projectId: input.projectId,
        presetId: entry.presetId,
        presetName: entry.presetName ? `${entry.presetName} (Revertido)` : "Estilo Revertido",
        dnaBuildingShape: entry.dnaBuildingShape,
        dnaStyle: entry.dnaStyle,
        dnaFeatures: entry.dnaFeatures,
        dnaPrimaryColor: entry.dnaPrimaryColor,
        dnaAccentColor: entry.dnaAccentColor,
        dnaMaterials: entry.dnaMaterials,
        dnaLandscaping: entry.dnaLandscaping,
        dnaLayout: entry.dnaLayout,
        dnaContext: entry.dnaContext,
        changeType: "preset_applied",
        notes: `Revertido para versão de ${entry.appliedAt.toLocaleString('pt-BR')}`,
        appliedBy: ctx.user.id,
      });

      console.log(`[DNA] Successfully reverted to history entry ${input.historyId}`);

      return {
        success: true,
        message: entry.presetName
          ? `Revertido para estilo "${entry.presetName}" com sucesso!`
          : "Revertido para estilo anterior com sucesso!",
      };
    }),
});
