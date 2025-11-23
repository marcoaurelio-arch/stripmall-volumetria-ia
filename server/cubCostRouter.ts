import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import {
  calculateConstructionCost,
  compareCosts,
  getAvailableStates,
  getBuildingTypes,
  getBuildingTypeDescription,
} from './services/cubCostService';

export const cubCostRouter = router({
  /**
   * Calcular custo de construção
   */
  calculate: protectedProcedure
    .input(z.object({
      state: z.string(),
      buildingType: z.enum(['comercial_padrao', 'comercial_alto', 'industrial_padrao', 'shopping_center']),
      totalArea: z.number().positive(),
      floors: z.number().int().positive(),
      qualityFactor: z.number().min(0.8).max(1.2).optional(),
      complexityFactor: z.number().min(0.9).max(1.3).optional(),
    }))
    .query(({ input }) => {
      return calculateConstructionCost(input);
    }),

  /**
   * Comparar custos entre diferentes opções
   */
  compare: protectedProcedure
    .input(z.object({
      options: z.array(z.object({
        state: z.string(),
        buildingType: z.enum(['comercial_padrao', 'comercial_alto', 'industrial_padrao', 'shopping_center']),
        totalArea: z.number().positive(),
        floors: z.number().int().positive(),
        qualityFactor: z.number().min(0.8).max(1.2).optional(),
        complexityFactor: z.number().min(0.9).max(1.3).optional(),
      })),
    }))
    .query(({ input }) => {
      return compareCosts(input.options);
    }),

  /**
   * Obter estados disponíveis
   */
  getStates: protectedProcedure
    .query(() => {
      return getAvailableStates();
    }),

  /**
   * Obter tipos de construção disponíveis
   */
  getBuildingTypes: protectedProcedure
    .query(() => {
      return getBuildingTypes().map(type => ({
        value: type,
        label: getBuildingTypeDescription(type),
      }));
    }),
});
