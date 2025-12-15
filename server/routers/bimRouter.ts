/**
 * Router tRPC para Exportação BIM/IFC
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { generateIFC, ifcStringToBuffer, generateIFCFileName } from '../services/bimExportService';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { projects, analyses } from '../../drizzle/schema';
import { storagePut } from '../storage';

export const bimRouter = router({
  /**
   * Exporta projeto como arquivo IFC
   */
  exportIFC: protectedProcedure
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

      // Buscar última análise volumétrica
      const analysis = await db
        .select()
        .from(analyses)
        .where(eq(analyses.projectId, input.projectId))
        .orderBy(analyses.createdAt)
        .limit(1);

      if (analysis.length === 0) {
        throw new Error('Nenhuma análise volumétrica encontrada. Execute a análise primeiro.');
      }

      const latestAnalysis = analysis[0];

      // Analisar geometria do terreno
      const { analyzePolygonGeometry } = await import('../geometryAnalyzer');
      const polygonCoords = project[0].polygonCoordinates 
        ? JSON.parse(project[0].polygonCoordinates) 
        : null;
      
      const geometryAnalysis = polygonCoords 
        ? analyzePolygonGeometry(polygonCoords)
        : null;

      // Preparar dados para exportação IFC
      const exportOptions = {
        projectName: project[0].name,
        projectDescription: project[0].description || undefined,
        terrainArea: project[0].area,
        buildableArea: latestAnalysis.areaMaximaConstruida || 0,
        occupiedArea: latestAnalysis.areaOcupada || 0,
        numberOfStores: latestAnalysis.numeroLojas || 0,
        parkingSpaces: latestAnalysis.vagasEstacionamento || 0,
        numberOfFloors: 1, // Térreo (strip malls são tipicamente térreos)
        
        // Dimensões do terreno
        terrainWidth: geometryAnalysis?.dimensions.width || Math.sqrt(project[0].area),
        terrainLength: geometryAnalysis?.dimensions.length || Math.sqrt(project[0].area),
        
        // Parâmetros urbanísticos
        occupancyRate: project[0].taxaOcupacao || 0,
        buildingCoefficient: (project[0].coeficienteAproveitamento || 0) / 100,
        setbackFront: project[0].recuoFrontal || 0,
        setbackSide: project[0].recuoLateral || 0,
        setbackRear: project[0].recuoFundos || 0,
        
        // Dados adicionais
        address: project[0].address || undefined,
        briefing: project[0].briefing || undefined
      };

      // Gerar arquivo IFC
      const ifcContent = generateIFC(exportOptions);
      const ifcBuffer = ifcStringToBuffer(ifcContent);

      // Fazer upload para S3
      const fileName = generateIFCFileName(project[0].name);
      const fileKey = `projects/${input.projectId}/exports/${fileName}`;
      
      const { url } = await storagePut(
        fileKey,
        ifcBuffer,
        'application/x-step'
      );

      return {
        url,
        fileName,
        fileSize: ifcBuffer.length
      };
    }),

  /**
   * Gera prévia do conteúdo IFC (primeiras 100 linhas)
   */
  previewIFC: protectedProcedure
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

      if (project[0].userId !== ctx.user.id) {
        throw new Error('Você não tem permissão para acessar este projeto');
      }

      // Buscar última análise
      const analysis = await db
        .select()
        .from(analyses)
        .where(eq(analyses.projectId, input.projectId))
        .orderBy(analyses.createdAt)
        .limit(1);

      if (analysis.length === 0) {
        throw new Error('Nenhuma análise volumétrica encontrada');
      }

      const latestAnalysis = analysis[0];

      // Analisar geometria
      const { analyzePolygonGeometry } = await import('../geometryAnalyzer');
      const polygonCoords = project[0].polygonCoordinates 
        ? JSON.parse(project[0].polygonCoordinates) 
        : null;
      
      const geometryAnalysis = polygonCoords 
        ? analyzePolygonGeometry(polygonCoords)
        : null;

      // Preparar dados
      const exportOptions = {
        projectName: project[0].name,
        projectDescription: project[0].description || undefined,
        terrainArea: project[0].area,
        buildableArea: latestAnalysis.areaMaximaConstruida || 0,
        occupiedArea: latestAnalysis.areaOcupada || 0,
        numberOfStores: latestAnalysis.numeroLojas || 0,
        parkingSpaces: latestAnalysis.vagasEstacionamento || 0,
        numberOfFloors: 1, // Térreo (strip malls são tipicamente térreos)
        terrainWidth: geometryAnalysis?.dimensions.width || Math.sqrt(project[0].area),
        terrainLength: geometryAnalysis?.dimensions.length || Math.sqrt(project[0].area),
        occupancyRate: project[0].taxaOcupacao || 0,
        buildingCoefficient: (project[0].coeficienteAproveitamento || 0) / 100,
        setbackFront: project[0].recuoFrontal || 0,
        setbackSide: project[0].recuoLateral || 0,
        setbackRear: project[0].recuoFundos || 0,
        address: project[0].address || undefined,
        briefing: project[0].briefing || undefined
      };

      // Gerar IFC completo
      const ifcContent = generateIFC(exportOptions);
      
      // Retornar primeiras 100 linhas para prévia
      const lines = ifcContent.split('\n');
      const preview = lines.slice(0, 100).join('\n');
      
      return {
        preview,
        totalLines: lines.length,
        estimatedSize: Buffer.byteLength(ifcContent, 'utf-8')
      };
    })
});
