import * as db from "../db";
import { analyzeTerrainGeometry } from "./terrainGeometryService";
import { getOrGenerateProjectDNA } from "./projectDNAHelper";
import { type ProjectDNA } from "./projectDNAService";

/**
 * Contexto completo do projeto para geração de imagens consistentes
 */
export interface ProjectContext {
  project: Awaited<ReturnType<typeof db.getProjectById>>;
  dna: ProjectDNA;
  analysis: Awaited<ReturnType<typeof db.getLatestAnalysis>> | null;
  geometryInfo: string;
  briefingSection: string;
  criticalRequirements: string;
}

/**
 * Constrói contexto completo e validado do projeto
 * Garante que TODAS as imagens geradas tenham dados consistentes
 */
export async function buildProjectContext(projectId: number): Promise<ProjectContext> {
  // Buscar dados do projeto
  const project = await db.getProjectById(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Obter ou gerar DNA do projeto (garante consistência visual)
  const dna = await getOrGenerateProjectDNA(projectId);

  // Buscar última análise volumétrica (dados reais calculados)
  const analysis = await db.getLatestAnalysis(projectId);

  // Analisar geometria do terreno
  let geometryInfo = "";
  if (project.polygonCoordinates) {
    try {
      const coordinates = JSON.parse(project.polygonCoordinates);
      const geometry = analyzeTerrainGeometry(coordinates);
      geometryInfo = `\n\nSITE GEOMETRY (CRITICAL - MUST MATCH EXACTLY):
${geometry.promptDescription}
- Exact lot dimensions: ${geometry.dimensions.width}m (width) x ${geometry.dimensions.length}m (length)
- Lot shape: ${geometry.shape.type} (${geometry.vertices} vertices)
- Main orientation: ${geometry.orientation.cardinalDirection} (${geometry.orientation.mainAxis}°)
- ${geometry.orientation.solarOrientation}
- Perimeter: ${geometry.dimensions.perimeter}m
- The building MUST respect this exact ${geometry.shape.type} lot geometry`;
    } catch (error) {
      console.warn("[ProjectContext] Failed to parse geometry:", error);
    }
  }

  // Briefing do projeto
  const briefingSection = project.briefing
    ? `\n\nPROJECT BRIEFING (CRITICAL - MUST FOLLOW):
${project.briefing}`
    : "";

  // Requisitos críticos baseados em dados reais
  const criticalRequirements = `
CRITICAL PROJECT REQUIREMENTS (MUST MATCH EXACTLY):
- Total lot area: ${project.area}m²
- Building footprint: ${project.width || "calculated"}m x ${project.length || "calculated"}m
${analysis ? `- Number of retail units: ${analysis.numeroLojas} stores (EXACT - not approximate)` : ""}
${analysis ? `- Total built area: ${analysis.areaMaximaConstruida}m² (EXACT)` : ""}
${analysis ? `- Parking spaces: ${analysis.vagasEstacionamento} spaces (EXACT)` : ""}
${analysis ? `- Building height: ${analysis.volumetriaHeight}m` : ""}
${project.taxaOcupacao ? `- Occupancy rate: ${project.taxaOcupacao}%` : ""}
${project.coeficienteAproveitamento ? `- Building coefficient: ${project.coeficienteAproveitamento / 100}` : ""}
${project.recuoFrontal ? `- Front setback: ${project.recuoFrontal}m` : ""}
${project.recuoLateral ? `- Side setback: ${project.recuoLateral}m` : ""}
${project.recuoFundos ? `- Rear setback: ${project.recuoFundos}m` : ""}

IMPORTANT: All dimensions, quantities, and specifications above are MANDATORY and must be accurately represented in the generated image.`;

  return {
    project,
    dna,
    analysis,
    geometryInfo,
    briefingSection,
    criticalRequirements,
  };
}

/**
 * Valida se o prompt contém todos os dados críticos do projeto
 */
export function validatePromptCompleteness(prompt: string, context: ProjectContext): {
  isValid: boolean;
  missingData: string[];
  warnings: string[];
} {
  const missingData: string[] = [];
  const warnings: string[] = [];

  // Verificar dados obrigatórios
  if (context.project && !prompt.includes(context.project.area.toString())) {
    missingData.push("Total lot area");
  }

  if (context.analysis && context.analysis.numeroLojas !== null) {
    if (!prompt.includes(context.analysis.numeroLojas.toString())) {
      missingData.push("Number of stores");
    }
    if (context.analysis.areaMaximaConstruida !== null && !prompt.includes(context.analysis.areaMaximaConstruida.toString())) {
      warnings.push("Total built area not explicitly mentioned");
    }
  }

  if (context.project && context.project.briefing && !prompt.toLowerCase().includes("briefing")) {
    warnings.push("Project briefing may not be included");
  }

  if (context.project && context.project.polygonCoordinates && !prompt.toLowerCase().includes("geometry")) {
    missingData.push("Site geometry");
  }

  return {
    isValid: missingData.length === 0,
    missingData,
    warnings,
  };
}
