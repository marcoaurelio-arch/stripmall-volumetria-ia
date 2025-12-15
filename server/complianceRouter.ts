import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { generateComplianceChecklist, formatComplianceReport } from "./complianceChecklistService";

export const complianceRouter = router({
  /**
   * Gera checklist de conformidade para um projeto
   */
  generateChecklist: publicProcedure
    .input(z.object({
      projectId: z.number(),
      area: z.number(),
      totalBuiltArea: z.number(),
      commercialArea: z.number(),
      parkingSpaces: z.number(),
      parkingArea: z.number(),
      permeableArea: z.number(),
      setbackFront: z.number(),
      setbackSide: z.number(),
      setbackRear: z.number(),
      occupancyRate: z.number(),
      buildingCoefficient: z.number(),
      numberOfStores: z.number(),
      state: z.string(),
    }))
    .query(({ input }) => {
      const report = generateComplianceChecklist(input);
      
      return {
        success: true,
        report,
      };
    }),

  /**
   * Exporta checklist em formato Markdown
   */
  exportChecklistMarkdown: publicProcedure
    .input(z.object({
      projectId: z.number(),
      area: z.number(),
      totalBuiltArea: z.number(),
      commercialArea: z.number(),
      parkingSpaces: z.number(),
      parkingArea: z.number(),
      permeableArea: z.number(),
      setbackFront: z.number(),
      setbackSide: z.number(),
      setbackRear: z.number(),
      occupancyRate: z.number(),
      buildingCoefficient: z.number(),
      numberOfStores: z.number(),
      state: z.string(),
    }))
    .query(({ input }) => {
      const report = generateComplianceChecklist(input);
      const markdown = formatComplianceReport(report);
      
      return {
        success: true,
        markdown,
        filename: `checklist-conformidade-projeto-${input.projectId}.md`,
      };
    }),
});
