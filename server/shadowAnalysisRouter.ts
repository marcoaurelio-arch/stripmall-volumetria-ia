import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  analyzeShadow,
  analyzeShadowMultipleHours,
  analyzeShadowSeasons,
} from "./services/shadowAnalysisService";

export const shadowAnalysisRouter = router({
  /**
   * Analisa sombreamento para um horário específico
   */
  analyze: publicProcedure
    .input(
      z.object({
        buildingLayout: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
          rotation: z.number(),
          scale: z.number(),
        }),
        buildingHeight: z.number(),
        terrain: z.object({
          width: z.number(),
          length: z.number(),
          area: z.number(),
        }),
        location: z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        }),
        datetime: z.string(), // ISO string
      })
    )
    .query(({ input }) => {
      const result = analyzeShadow({
        ...input,
        datetime: new Date(input.datetime),
      });
      return result;
    }),

  /**
   * Analisa sombreamento em múltiplos horários
   */
  analyzeMultipleHours: publicProcedure
    .input(
      z.object({
        buildingLayout: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
          rotation: z.number(),
          scale: z.number(),
        }),
        buildingHeight: z.number(),
        terrain: z.object({
          width: z.number(),
          length: z.number(),
          area: z.number(),
        }),
        location: z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        }),
        date: z.string(), // ISO string
        hours: z.array(z.number().min(0).max(23)),
      })
    )
    .query(({ input }) => {
      const results = analyzeShadowMultipleHours(
        {
          buildingLayout: input.buildingLayout,
          buildingHeight: input.buildingHeight,
          terrain: input.terrain,
          location: input.location,
        },
        new Date(input.date),
        input.hours
      );
      return results;
    }),

  /**
   * Analisa sombreamento em diferentes estações
   */
  analyzeSeasons: publicProcedure
    .input(
      z.object({
        buildingLayout: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
          rotation: z.number(),
          scale: z.number(),
        }),
        buildingHeight: z.number(),
        terrain: z.object({
          width: z.number(),
          length: z.number(),
          area: z.number(),
        }),
        location: z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        }),
        year: z.number(),
      })
    )
    .query(({ input }) => {
      const results = analyzeShadowSeasons(
        {
          buildingLayout: input.buildingLayout,
          buildingHeight: input.buildingHeight,
          terrain: input.terrain,
          location: input.location,
        },
        input.year
      );
      return results;
    }),
});
