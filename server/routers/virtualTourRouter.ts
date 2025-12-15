/**
 * Router tRPC para Tour Virtual 360°
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { generateVirtualTour, generateCustomPanorama } from '../services/virtualTourService';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { projects, virtualTours } from '../../drizzle/schema';
import { storagePut } from '../storage';

export const virtualTourRouter = router({
  /**
   * Gera tour virtual completo para um projeto
   */
  generateTour: protectedProcedure
    .input(z.object({
      projectId: z.number()
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

      // Analisar geometria do terreno
      const { analyzePolygonGeometry } = await import('../geometryAnalyzer');
      const polygonCoords = project[0].polygonCoordinates 
        ? JSON.parse(project[0].polygonCoordinates) 
        : null;
      
      const geometryAnalysis = polygonCoords 
        ? analyzePolygonGeometry(polygonCoords)
        : null;

      const geometryDescription = geometryAnalysis
        ? `Terrain shape: ${geometryAnalysis.shape}, dimensions: ${geometryAnalysis.dimensions.width.toFixed(1)}m × ${geometryAnalysis.dimensions.length.toFixed(1)}m, orientation: ${geometryAnalysis.orientation}`
        : `Rectangular terrain, area: ${project[0].area}m²`;

      // Gerar tour virtual
      const tour = await generateVirtualTour(
        input.projectId,
        project[0].name,
        project[0].description || 'Strip mall commercial development',
        project[0].area,
        geometryDescription,
        project[0].briefing || undefined
      );

      // Salvar tour no banco de dados
      const tourData = {
        projectId: input.projectId,
        scenes: JSON.stringify(tour.scenes),
        defaultScene: tour.defaultScene,
        createdAt: new Date()
      };

      // Verificar se já existe tour para este projeto
      const existingTour = await db
        .select()
        .from(virtualTours)
        .where(eq(virtualTours.projectId, input.projectId))
        .limit(1);

      if (existingTour.length > 0) {
        // Atualizar tour existente
        await db
          .update(virtualTours)
          .set({
            scenes: tourData.scenes,
            defaultScene: tourData.defaultScene,
            createdAt: tourData.createdAt
          })
          .where(eq(virtualTours.projectId, input.projectId));
      } else {
        // Criar novo tour
        await db.insert(virtualTours).values(tourData);
      }

      return tour;
    }),

  /**
   * Busca tour virtual de um projeto
   */
  getTour: protectedProcedure
    .input(z.object({
      projectId: z.number()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Buscar projeto para verificar permissão
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (project.length === 0) {
        throw new Error('Projeto não encontrado');
      }

      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Buscar tour
      const tour = await db
        .select()
        .from(virtualTours)
        .where(eq(virtualTours.projectId, input.projectId))
        .limit(1);

      if (tour.length === 0) {
        return null;
      }

      return {
        projectId: tour[0].projectId,
        scenes: JSON.parse(tour[0].scenes),
        defaultScene: tour[0].defaultScene,
        createdAt: tour[0].createdAt
      };
    }),

  /**
   * Gera panorama 360° personalizado
   */
  generateCustomPanorama: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      viewpointName: z.string(),
      viewpointDescription: z.string()
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

      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Analisar geometria
      const { analyzePolygonGeometry } = await import('../geometryAnalyzer');
      const polygonCoords = project[0].polygonCoordinates 
        ? JSON.parse(project[0].polygonCoordinates) 
        : null;
      
      const geometryAnalysis = polygonCoords 
        ? analyzePolygonGeometry(polygonCoords)
        : null;

      const geometryDescription = geometryAnalysis
        ? `Terrain shape: ${geometryAnalysis.shape}, dimensions: ${geometryAnalysis.dimensions.width.toFixed(1)}m × ${geometryAnalysis.dimensions.length.toFixed(1)}m`
        : `Area: ${project[0].area}m²`;

      // Gerar panorama
      const imageUrl = await generateCustomPanorama(
        project[0].name,
        project[0].description || 'Strip mall commercial development',
        project[0].area,
        geometryDescription,
        input.viewpointName,
        input.viewpointDescription,
        project[0].briefing || undefined
      );

      return { imageUrl };
    }),

  /**
   * Deleta tour virtual de um projeto
   */
  deleteTour: protectedProcedure
    .input(z.object({
      projectId: z.number()
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

      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Deletar tour
      await db
        .delete(virtualTours)
        .where(eq(virtualTours.projectId, input.projectId));

      return { success: true };
    })
});
