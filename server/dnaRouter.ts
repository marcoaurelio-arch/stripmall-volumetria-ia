import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getOrGenerateProjectDNA } from "./services/projectDNAHelper";

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
});
