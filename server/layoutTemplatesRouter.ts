import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  LAYOUT_TEMPLATES,
  getTemplatesByCategory,
  getTemplateById,
  recommendTemplates,
  applyTemplate,
} from "./services/layoutTemplatesService";

export const layoutTemplatesRouter = router({
  /**
   * Lista todos os templates disponíveis
   */
  list: publicProcedure.query(() => {
    return LAYOUT_TEMPLATES;
  }),

  /**
   * Busca templates por categoria
   */
  byCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(['retangular', 'L', 'esquina', 'irregular']),
      })
    )
    .query(({ input }) => {
      return getTemplatesByCategory(input.category);
    }),

  /**
   * Busca template específico por ID
   */
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      const template = getTemplateById(input.id);
      if (!template) {
        throw new Error(`Template ${input.id} não encontrado`);
      }
      return template;
    }),

  /**
   * Recomenda templates baseado em características do terreno
   */
  recommend: publicProcedure
    .input(
      z.object({
        width: z.number(),
        length: z.number(),
        area: z.number(),
        isCorner: z.boolean().optional(),
        isIrregular: z.boolean().optional(),
        hasLShape: z.boolean().optional(),
      })
    )
    .query(({ input }) => {
      return recommendTemplates(input);
    }),

  /**
   * Aplica template ajustando para o terreno específico
   */
  applyTemplate: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
        terrain: z.object({
          width: z.number(),
          length: z.number(),
          area: z.number(),
          setbacks: z.object({
            frontal: z.number(),
            lateral: z.number(),
            fundos: z.number(),
          }),
        }),
      })
    )
    .mutation(({ input }) => {
      const layout = applyTemplate(input.templateId, input.terrain);
      if (!layout) {
        throw new Error(`Não foi possível aplicar template ${input.templateId}`);
      }
      return layout;
    }),
});
