import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { optimizeLayout } from "./services/layoutOptimizationService";

export const layoutOptimizationRouter = router({
  /**
   * Otimiza automaticamente o layout do edifício
   */
  optimize: publicProcedure
    .input(
      z.object({
        terrain: z.object({
          width: z.number(),
          length: z.number(),
          area: z.number(),
        }),
        setbacks: z.object({
          frontal: z.number(),
          lateral: z.number(),
          fundos: z.number(),
        }),
        preferences: z
          .object({
            prioritizeOccupancy: z.boolean().optional(),
            prioritizeSolar: z.boolean().optional(),
            minimizeWaste: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const optimized = optimizeLayout(input);
      return optimized;
    }),
});
