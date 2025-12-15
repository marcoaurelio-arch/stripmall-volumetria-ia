import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { generateProjectVariations, ProjectConstraints } from "./projectVariationsService";

export const variationsRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        totalArea: z.number(),
        buildableArea: z.number(),
        occupancyRate: z.number(),
        buildingCoefficient: z.number(),
        setbackFront: z.number(),
        setbackSide: z.number(),
        setbackRear: z.number(),
        minParkingSpaces: z.number(),
        permeableAreaRequired: z.number(),
        count: z.number().min(3).max(10).default(5),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const constraints: ProjectConstraints = {
          totalArea: input.totalArea,
          buildableArea: input.buildableArea,
          occupancyRate: input.occupancyRate,
          buildingCoefficient: input.buildingCoefficient,
          setbackFront: input.setbackFront,
          setbackSide: input.setbackSide,
          setbackRear: input.setbackRear,
          minParkingSpaces: input.minParkingSpaces,
          permeableAreaRequired: input.permeableAreaRequired,
        };

        const result = await generateProjectVariations(constraints, input.count);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("[VariationsRouter] Error generating variations:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate variations",
        };
      }
    }),
});
