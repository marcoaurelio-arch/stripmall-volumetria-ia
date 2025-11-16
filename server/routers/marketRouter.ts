/**
 * Router tRPC para Análise de Mercado Imobiliário
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { analyzeMarket } from '../services/marketAnalysisService';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { projects } from '../../drizzle/schema';

export const marketRouter = router({
  /**
   * Analisa o mercado imobiliário de um projeto
   */
  analyzeProjectMarket: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      radius: z.number().optional().default(5000) // raio em metros
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Buscar projeto
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (project.length === 0) {
        throw new Error('Projeto não encontrado');
      }

      // Verificar se o usuário é dono do projeto
      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Verificar se o projeto tem coordenadas
      if (!project[0].latitude || !project[0].longitude) {
        throw new Error('Projeto não possui coordenadas definidas');
      }

      // Realizar análise de mercado
      const analysis = await analyzeMarket(
        parseFloat(project[0].latitude!),
        parseFloat(project[0].longitude!),
        input.radius
      );

      return analysis;
    }),

  /**
   * Analisa mercado por coordenadas (para uso durante criação de projeto)
   */
  analyzeByCoordinates: protectedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().optional().default(5000)
    }))
    .query(async ({ input }) => {
      const analysis = await analyzeMarket(
        input.latitude,
        input.longitude,
        input.radius
      );

      return analysis;
    }),

  /**
   * Busca apenas concorrentes (mais leve que análise completa)
   */
  getCompetitors: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      radius: z.number().optional().default(5000)
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Buscar projeto
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (project.length === 0) {
        throw new Error('Projeto não encontrado');
      }

      // Verificar se o usuário é dono do projeto
      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Verificar se o projeto tem coordenadas
      if (!project[0].latitude || !project[0].longitude) {
        throw new Error('Projeto não possui coordenadas definidas');
      }

      // Importar função de busca de concorrentes
      const { findCompetitors } = await import('../services/marketAnalysisService');
      
      const competitors = await findCompetitors(
        parseFloat(project[0].latitude!),
        parseFloat(project[0].longitude!),
        input.radius
      );

      return competitors;
    }),

  /**
   * Busca apenas dados demográficos
   */
  getDemographics: protectedProcedure
    .input(z.object({
      projectId: z.number()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Buscar projeto
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (project.length === 0) {
        throw new Error('Projeto não encontrado');
      }

      // Verificar se o usuário é dono do projeto
      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Verificar se o projeto tem coordenadas
      if (!project[0].latitude || !project[0].longitude) {
        throw new Error('Projeto não possui coordenadas definidas');
      }

      // Importar função de busca de dados demográficos
      const { getDemographicData } = await import('../services/marketAnalysisService');
      
      const demographics = await getDemographicData(
        parseFloat(project[0].latitude!),
        parseFloat(project[0].longitude!)
      );

      return demographics;
    })
});
