import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { validateSetbacks, formatViolationMessage, suggestCorrection } from "./services/setbackValidationService";

export const layoutValidationRouter = router({
  // Validar recuos do layout
  validateSetbacks: publicProcedure
    .input(
      z.object({
        layout: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
          rotation: z.number(),
          scale: z.number(),
        }),
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
      })
    )
    .query(({ input }) => {
      const result = validateSetbacks(input.layout, input.terrain, input.setbacks);

      return {
        isValid: result.isValid,
        violations: result.violations.map((v) => ({
          ...v,
          message: formatViolationMessage(v),
        })),
        warnings: result.warnings,
        buildingFootprint: result.buildingFootprint,
        actualSetbacks: result.actualSetbacks,
      };
    }),

  // Sugerir correção automática
  suggestCorrection: publicProcedure
    .input(
      z.object({
        layout: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
          rotation: z.number(),
          scale: z.number(),
        }),
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
      })
    )
    .mutation(({ input }) => {
      const result = validateSetbacks(input.layout, input.terrain, input.setbacks);

      if (result.isValid) {
        return {
          needsCorrection: false,
          correctedLayout: input.layout,
        };
      }

      const correctedLayout = suggestCorrection(input.layout, result.violations);

      return {
        needsCorrection: true,
        correctedLayout,
        violationsFixed: result.violations.length,
      };
    }),
});
