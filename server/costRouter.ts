import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { calculateConstructionCost, calculateFinancialViability, getAvailableStates } from "./costCalculationService";

export const costRouter = router({
  /**
   * Calcula custo de construção baseado em parâmetros do projeto
   */
  calculateCost: publicProcedure
    .input(z.object({
      totalArea: z.number(),
      state: z.string(),
      standard: z.enum(["low", "medium", "high", "luxury"]),
      commercialArea: z.number().optional(),
      parkingArea: z.number().optional(),
      commonArea: z.number().optional(),
    }))
    .query(({ input }) => {
      const result = calculateConstructionCost(input);
      
      return {
        success: true,
        ...result,
      };
    }),

  /**
   * Calcula viabilidade financeira do projeto
   */
  calculateViability: publicProcedure
    .input(z.object({
      totalCost: z.number(),
      commercialArea: z.number(),
      averageRentPerSqm: z.number(),
      occupancyRate: z.number(),
      operatingCosts: z.number(),
    }))
    .query(({ input }) => {
      const result = calculateFinancialViability(input);
      
      return {
        success: true,
        ...result,
      };
    }),

  /**
   * Retorna análise completa de custos e viabilidade
   */
  getCompleteAnalysis: publicProcedure
    .input(z.object({
      projectId: z.number(),
      totalArea: z.number(),
      state: z.string(),
      standard: z.enum(["low", "medium", "high", "luxury"]),
      commercialArea: z.number(),
      parkingArea: z.number().optional(),
      commonArea: z.number().optional(),
      averageRentPerSqm: z.number().optional(),
      occupancyRate: z.number().optional(),
      operatingCosts: z.number().optional(),
    }))
    .query(({ input }) => {
      // Calcular custos de construção
      const costAnalysis = calculateConstructionCost({
        totalArea: input.totalArea,
        state: input.state,
        standard: input.standard,
        commercialArea: input.commercialArea,
        parkingArea: input.parkingArea,
        commonArea: input.commonArea,
      });
      
      // Calcular viabilidade financeira (se parâmetros fornecidos)
      let viability = null;
      if (input.averageRentPerSqm && input.occupancyRate && input.operatingCosts) {
        viability = calculateFinancialViability({
          totalCost: costAnalysis.totalCost,
          commercialArea: input.commercialArea,
          averageRentPerSqm: input.averageRentPerSqm,
          occupancyRate: input.occupancyRate,
          operatingCosts: input.operatingCosts,
        });
      }
      
      return {
        success: true,
        costs: costAnalysis,
        viability,
      };
    }),

  /**
   * Lista estados disponíveis com dados de CUB
   */
  getAvailableStates: publicProcedure.query(() => {
    const states = getAvailableStates();
    return {
      success: true,
      states,
    };
  }),

  /**
   * Retorna custos de referência por estado e padrão
   */
  getCostReference: publicProcedure
    .input(z.object({
      state: z.string(),
      standard: z.enum(["low", "medium", "high", "luxury"]),
    }))
    .query(({ input }) => {
      const states = getAvailableStates();
      const stateData = states.find(s => s.state === input.state);
      
      if (!stateData) {
        return {
          success: false,
          message: "Estado não encontrado na base de dados",
        };
      }
      
      return {
        success: true,
        state: stateData.state,
        stateName: stateData.stateName,
        costPerSqm: stateData.costs[input.standard],
        standard: input.standard,
      };
    }),
});
