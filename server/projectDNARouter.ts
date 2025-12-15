import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateProjectDNA, dnaToPromptDescription, type ProjectDNA } from "./services/projectDNAService";

export const projectDNARouter = router({
  /**
   * Gera o DNA arquitetônico do projeto baseado nos dados existentes
   */
  generate: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar dados do projeto
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project) {
        throw new Error("Project not found");
      }

      // Verificar se o usuário é dono do projeto
      if (project.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Determinar tipo de terreno baseado em dimensões
      let terrainShape = "rectangular";
      if (project.width && project.length) {
        const ratio = Math.max(project.width, project.length) / Math.min(project.width, project.length);
        if (ratio > 3) {
          terrainShape = "L";
        }
      }

      // Gerar DNA
      const dna = generateProjectDNA({
        terrainArea: project.area,
        buildingArea: Math.floor(project.area * (project.taxaOcupacao || 70) / 100),
        floors: Math.ceil((project.buildingHeight || 8) / 3),
        parkingSpaces: 0, // TODO: calcular baseado em área
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
        .where(eq(projects.id, input.projectId));

      return {
        success: true,
        dna,
        description: dnaToPromptDescription(dna),
      };
    }),

  /**
   * Obtém o DNA do projeto
   */
  get: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project) {
        throw new Error("Project not found");
      }

      if (project.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      if (!project.dnaGenerated) {
        return {
          generated: false,
          dna: null,
        };
      }

      const dna: ProjectDNA = {
        buildingShape: project.dnaBuildingShape || "",
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

      return {
        generated: true,
        dna,
        description: dnaToPromptDescription(dna),
      };
    }),

  /**
   * Atualiza o DNA do projeto manualmente
   */
  update: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      dna: z.object({
        buildingShape: z.string(),
        style: z.string(),
        features: z.array(z.string()),
        primaryColor: z.string(),
        accentColor: z.string(),
        materials: z.array(z.string()),
        landscaping: z.string(),
        layout: z.string(),
        context: z.string(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o usuário é dono do projeto
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project) {
        throw new Error("Project not found");
      }

      if (project.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Atualizar DNA
      await db
        .update(projects)
        .set({
          dnaGenerated: 1,
          dnaBuildingShape: input.dna.buildingShape,
          dnaStyle: input.dna.style,
          dnaFeatures: JSON.stringify(input.dna.features),
          dnaPrimaryColor: input.dna.primaryColor,
          dnaAccentColor: input.dna.accentColor,
          dnaMaterials: JSON.stringify(input.dna.materials),
          dnaLandscaping: input.dna.landscaping,
          dnaLayout: input.dna.layout,
          dnaContext: input.dna.context,
        })
        .where(eq(projects.id, input.projectId));

      return {
        success: true,
      };
    }),

  /**
   * Reseta o DNA do projeto (forçar regeneração)
   */
  reset: protectedProcedure
    .input(z.object({
      projectId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o usuário é dono do projeto
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project) {
        throw new Error("Project not found");
      }

      if (project.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Resetar DNA
      await db
        .update(projects)
        .set({
          dnaGenerated: 0,
          dnaBuildingShape: null,
          dnaStyle: null,
          dnaFeatures: null,
          dnaPrimaryColor: null,
          dnaAccentColor: null,
          dnaMaterials: null,
          dnaLandscaping: null,
          dnaLayout: null,
          dnaContext: null,
        })
        .where(eq(projects.id, input.projectId));

      return {
        success: true,
      };
    }),
});
