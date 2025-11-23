import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { getDb } from './db';
import { customTemplates } from '../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const customTemplatesRouter = router({
  /**
   * Criar novo template personalizado
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(['retangular', 'L', 'esquina', 'irregular', 'outro']),
      offsetX: z.number(),
      offsetY: z.number(),
      rotation: z.number(),
      scale: z.number(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().default(false),
      recommendedMinArea: z.number().optional(),
      recommendedMaxArea: z.number().optional(),
      recommendedAspectRatio: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(customTemplates).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        category: input.category,
        offsetX: Math.round(input.offsetX),
        offsetY: Math.round(input.offsetY),
        rotation: Math.round(input.rotation),
        scale: Math.round(input.scale),
        tags: input.tags ? JSON.stringify(input.tags) : null,
        isPublic: input.isPublic ? 1 : 0,
        recommendedMinArea: input.recommendedMinArea ? Math.round(input.recommendedMinArea) : null,
        recommendedMaxArea: input.recommendedMaxArea ? Math.round(input.recommendedMaxArea) : null,
        recommendedAspectRatio: input.recommendedAspectRatio ? Math.round(input.recommendedAspectRatio * 100) : null,
      });

      const insertId = (result as any).insertId;
      return {
        id: Number(insertId),
        message: 'Template criado com sucesso',
      };
    }),

  /**
   * Listar templates do usuário
   */
  myTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const templates = await db
        .select()
        .from(customTemplates)
        .where(eq(customTemplates.userId, ctx.user.id))
        .orderBy(desc(customTemplates.createdAt));

      return templates.map(t => ({
        ...t,
        tags: t.tags ? JSON.parse(t.tags) : [],
        isPublic: t.isPublic === 1,
        rating: t.rating ? t.rating / 100 : 0,
        recommendedAspectRatio: t.recommendedAspectRatio ? t.recommendedAspectRatio / 100 : null,
      }));
    }),

  /**
   * Listar templates públicos (comunidade)
   */
  publicTemplates: protectedProcedure
    .input(z.object({
      category: z.enum(['retangular', 'L', 'esquina', 'irregular', 'outro']).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let templates;
      if (input.category) {
        templates = await db
          .select()
          .from(customTemplates)
          .where(and(
            eq(customTemplates.isPublic, 1),
            eq(customTemplates.category, input.category)
          ))
          .orderBy(desc(customTemplates.usageCount), desc(customTemplates.rating))
          .limit(input.limit);
      } else {
        templates = await db
          .select()
          .from(customTemplates)
          .where(eq(customTemplates.isPublic, 1))
          .orderBy(desc(customTemplates.usageCount), desc(customTemplates.rating))
          .limit(input.limit);
      }

      return templates.map(t => ({
        ...t,
        tags: t.tags ? JSON.parse(t.tags) : [],
        isPublic: t.isPublic === 1,
        rating: t.rating ? t.rating / 100 : 0,
        recommendedAspectRatio: t.recommendedAspectRatio ? t.recommendedAspectRatio / 100 : null,
      }));
    }),

  /**
   * Buscar template por ID
   */
  byId: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const templates = await db
        .select()
        .from(customTemplates)
        .where(eq(customTemplates.id, input.id))
        .limit(1);

      if (templates.length === 0) return null;

      const template = templates[0];

      // Verificar permissão
      if (template.isPublic === 0 && template.userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este template');
      }

      return {
        ...template,
        tags: template.tags ? JSON.parse(template.tags) : [],
        isPublic: template.isPublic === 1,
        rating: template.rating ? template.rating / 100 : 0,
        recommendedAspectRatio: template.recommendedAspectRatio ? template.recommendedAspectRatio / 100 : null,
      };
    }),

  /**
   * Atualizar template
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      category: z.enum(['retangular', 'L', 'esquina', 'irregular', 'outro']).optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar propriedade
      const existing = await db
        .select()
        .from(customTemplates)
        .where(eq(customTemplates.id, input.id))
        .limit(1);

      if (existing.length === 0 || existing[0].userId !== ctx.user.id) {
        throw new Error('Template não encontrado ou você não tem permissão');
      }

      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.category !== undefined) updates.category = input.category;
      if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
      if (input.isPublic !== undefined) updates.isPublic = input.isPublic ? 1 : 0;

      if (Object.keys(updates).length > 0) {
        await db
          .update(customTemplates)
          .set(updates)
          .where(eq(customTemplates.id, input.id));
      }

      return { success: true };
    }),

  /**
   * Deletar template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar propriedade
      const existing = await db
        .select()
        .from(customTemplates)
        .where(eq(customTemplates.id, input.id))
        .limit(1);

      if (existing.length === 0 || existing[0].userId !== ctx.user.id) {
        throw new Error('Template não encontrado ou você não tem permissão');
      }

      await db
        .delete(customTemplates)
        .where(eq(customTemplates.id, input.id));

      return { success: true };
    }),

  /**
   * Incrementar contador de uso
   */
  incrementUsage: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(customTemplates)
        .set({
          usageCount: sql`${customTemplates.usageCount} + 1`,
        })
        .where(eq(customTemplates.id, input.id));

      return { success: true };
    }),

  /**
   * Avaliar template
   */
  rate: protectedProcedure
    .input(z.object({
      id: z.number(),
      rating: z.number().min(1).max(5),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Buscar template atual
      const templates = await db
        .select()
        .from(customTemplates)
        .where(eq(customTemplates.id, input.id))
        .limit(1);

      if (templates.length === 0) {
        throw new Error('Template não encontrado');
      }

      const template = templates[0];
      const currentRating = template.rating || 0;
      const currentCount = template.ratingCount || 0;

      // Calcular nova média
      const newCount = currentCount + 1;
      const newRating = Math.round(((currentRating * currentCount) + (input.rating * 100)) / newCount);

      await db
        .update(customTemplates)
        .set({
          rating: newRating,
          ratingCount: newCount,
        })
        .where(eq(customTemplates.id, input.id));

      return {
        success: true,
        newRating: newRating / 100,
        newCount,
      };
    }),
});
