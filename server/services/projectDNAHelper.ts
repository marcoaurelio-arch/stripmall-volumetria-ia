import { getDb } from "../db";
import { projects } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateProjectDNA, type ProjectDNA } from "./projectDNAService";

/**
 * Busca o DNA do projeto no banco de dados.
 * Se não existir, gera automaticamente e salva.
 */
export async function getOrGenerateProjectDNA(projectId: number): Promise<ProjectDNA> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar projeto
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  // Se DNA já existe, retornar
  if (project.dnaGenerated && project.dnaBuildingShape) {
    return {
      buildingShape: project.dnaBuildingShape,
      floors: Math.ceil((project.buildingHeight || 8) / 3),
      roofType: "Laje plana impermeabilizada",
      style: project.dnaStyle || "",
      features: project.dnaFeatures ? JSON.parse(project.dnaFeatures) : [],
      primaryColor: project.dnaPrimaryColor || "#FFFFFF",
      accentColor: project.dnaAccentColor || "#404040",
      materials: project.dnaMaterials ? JSON.parse(project.dnaMaterials) : [],
      landscaping: project.dnaLandscaping || "",
      layout: project.dnaLayout || "",
      context: project.dnaContext || "",
    };
  }

  // DNA não existe, gerar automaticamente
  let terrainShape = "rectangular";
  if (project.width && project.length) {
    const ratio = Math.max(project.width, project.length) / Math.min(project.width, project.length);
    if (ratio > 3) {
      terrainShape = "L";
    }
  }

  const dna = generateProjectDNA({
    terrainArea: project.area,
    buildingArea: Math.floor(project.area * (project.taxaOcupacao || 70) / 100),
    floors: Math.ceil((project.buildingHeight || 8) / 3),
    parkingSpaces: 0,
    buildingType: "strip_mall",
    terrainShape,
  });

  // Salvar DNA no banco
  await db
    .update(projects)
    .set({
      dnaGenerated: 1,
      dnaBuildingShape: dna.buildingShape,
      dnaStyle: dna.style,
      dnaFeatures: JSON.stringify(dna.features),
      dnaPrimaryColor: dna.primaryColor,
      dnaAccentColor: dna.accentColor,
      dnaMaterials: JSON.stringify(dna.materials),
      dnaLandscaping: dna.landscaping,
      dnaLayout: dna.layout,
      dnaContext: dna.context,
    })
    .where(eq(projects.id, projectId));

  return dna;
}
