/**
 * Gallery Router
 * Endpoints para galeria de projetos exemplo
 */
import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { getDb } from './db';
import { exampleProjects, projects } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const galleryRouter = router({
  /**
   * Listar todos os projetos exemplo
   */
  list: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const examples = await db
        .select()
        .from(exampleProjects)
        .orderBy(desc(exampleProjects.featured), desc(exampleProjects.consistencyScore));

      return examples;
    }),

  /**
   * Buscar projeto exemplo por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const example = await db
        .select()
        .from(exampleProjects)
        .where(eq(exampleProjects.id, input.id))
        .limit(1);

      if (example.length === 0) {
        throw new Error('Example project not found');
      }

      // Incrementar contador de visualizações
      await db
        .update(exampleProjects)
        .set({ viewCount: example[0].viewCount + 1 })
        .where(eq(exampleProjects.id, input.id));

      return example[0];
    }),

  /**
   * Duplicar projeto exemplo como novo projeto do usuário
   */
  duplicate: protectedProcedure
    .input(z.object({ exampleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Buscar projeto exemplo
      const example = await db
        .select()
        .from(exampleProjects)
        .where(eq(exampleProjects.id, input.exampleId))
        .limit(1);

      if (example.length === 0) {
        throw new Error('Example project not found');
      }

      const ex = example[0];

      // Criar novo projeto baseado no exemplo
      const [newProject] = await db.insert(projects).values({
        userId: ctx.user.id,
        name: `${ex.name} (Cópia)`,
        description: ex.description,
        briefing: `Projeto baseado no exemplo: ${ex.name}. ${ex.description}`,
        area: Number(ex.landArea),
        taxaOcupacao: Math.round(Number(ex.occupancyRate) * 100),
        coeficienteAproveitamento: Math.round(Number(ex.utilizationCoefficient) * 100),
        recuoFrontal: Number(ex.frontSetback),
        recuoLateral: Number(ex.sideSetback),
        recuoFundos: Number(ex.backSetback),
        dnaBuildingShape: ex.dnaBuildingShape,
        dnaStyle: ex.dnaStyle,
        dnaFeatures: ex.dnaFeatures,
        dnaPrimaryColor: ex.dnaPrimaryColor,
        dnaAccentColor: ex.dnaAccentColor,
        dnaMaterials: ex.dnaMaterials,
        dnaLandscaping: ex.dnaLandscaping,
        dnaLayout: ex.dnaLayout,
        dnaContext: ex.dnaContext,
        dnaGenerated: 1,
      });

      // Incrementar contador de duplicações
      await db
        .update(exampleProjects)
        .set({ duplicateCount: ex.duplicateCount + 1 })
        .where(eq(exampleProjects.id, input.exampleId));

      console.log(`[GALLERY] Projeto exemplo ${input.exampleId} duplicado como projeto ${newProject.insertId} pelo usuário ${ctx.user.id}`);

      return {
        projectId: Number(newProject.insertId),
        message: 'Projeto duplicado com sucesso!',
      };
    }),

  /**
   * Buscar projetos em destaque
   */
  getFeatured: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const featured = await db
        .select()
        .from(exampleProjects)
        .where(eq(exampleProjects.featured, 1))
        .orderBy(desc(exampleProjects.consistencyScore))
        .limit(3);

      return featured;
    }),
});
