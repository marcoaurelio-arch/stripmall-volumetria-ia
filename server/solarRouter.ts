import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { performSolarAnalysis } from "./solarAnalysisService";

export const solarRouter = router({
  /**
   * Realiza análise solar completa para um projeto
   */
  analyzeSolar: publicProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        buildingHeight: z.number().optional(),
        buildingWidth: z.number().optional(),
        buildingLength: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const analysis = performSolarAnalysis(input);
        return {
          success: true,
          data: analysis,
        };
      } catch (error) {
        console.error('[Solar Analysis] Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao realizar análise solar',
        };
      }
    }),
});
