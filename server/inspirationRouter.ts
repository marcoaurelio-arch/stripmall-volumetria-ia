import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { inspirationProjects, InsertInspirationProject } from "../drizzle/schema";
import { eq, like, and, gte, lte, desc } from "drizzle-orm";

/**
 * Router para gerenciar projetos de inspiração (catálogo de strip malls e centros comerciais relevantes)
 */
export const inspirationRouter = router({
  /**
   * Listar todos os projetos de inspiração com filtros opcionais
   */
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(["strip_mall", "open_mall", "shopping_center", "neighborhood_center"]).optional(),
        segment: z.enum(["popular", "medio", "alto_padrao"]).optional(),
        location: z.string().optional(), // Busca por cidade/estado
        minArea: z.number().optional(),
        maxArea: z.number().optional(),
        minStores: z.number().optional(),
        maxStores: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Construir condições de filtro
      const conditions = [];
      
      if (input?.category) {
        conditions.push(eq(inspirationProjects.category, input.category));
      }
      
      if (input?.segment) {
        conditions.push(eq(inspirationProjects.segment, input.segment));
      }
      
      if (input?.location) {
        conditions.push(like(inspirationProjects.location, `%${input.location}%`));
      }
      
      if (input?.minArea !== undefined) {
        conditions.push(gte(inspirationProjects.area, input.minArea));
      }
      
      if (input?.maxArea !== undefined) {
        conditions.push(lte(inspirationProjects.area, input.maxArea));
      }
      
      if (input?.minStores !== undefined) {
        conditions.push(gte(inspirationProjects.storeCount, input.minStores));
      }
      
      if (input?.maxStores !== undefined) {
        conditions.push(lte(inspirationProjects.storeCount, input.maxStores));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const projects = await db
        .select()
        .from(inspirationProjects)
        .where(whereClause)
        .orderBy(desc(inspirationProjects.year));

      return projects;
    }),

  /**
   * Buscar detalhes de um projeto de inspiração específico
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db
        .select()
        .from(inspirationProjects)
        .where(eq(inspirationProjects.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Projeto de inspiração não encontrado");
      }

      return result[0];
    }),

  /**
   * Criar novo projeto de inspiração (apenas admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().min(1),
        description: z.string().optional(),
        concept: z.string().optional(),
        area: z.number().optional(),
        storeCount: z.number().optional(),
        parkingSpaces: z.number().optional(),
        floors: z.number().optional(),
        year: z.number().optional(),
        architect: z.string().optional(),
        developer: z.string().optional(),
        anchors: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        category: z.enum(["strip_mall", "open_mall", "shopping_center", "neighborhood_center"]),
        segment: z.enum(["popular", "medio", "alto_padrao"]).default("medio"),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        images: z.array(z.string()).optional(),
        mainImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem criar projetos de inspiração");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const insertData: InsertInspirationProject = {
        name: input.name,
        location: input.location,
        description: input.description || null,
        concept: input.concept || null,
        area: input.area || null,
        storeCount: input.storeCount || null,
        parkingSpaces: input.parkingSpaces || null,
        floors: input.floors || null,
        year: input.year || null,
        architect: input.architect || null,
        developer: input.developer || null,
        anchors: input.anchors ? JSON.stringify(input.anchors) : null,
        features: input.features ? JSON.stringify(input.features) : null,
        category: input.category,
        segment: input.segment,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        images: input.images ? JSON.stringify(input.images) : null,
        mainImageUrl: input.mainImageUrl || null,
      };

      await db.insert(inspirationProjects).values(insertData);

      return {
        success: true,
      };
    }),

  /**
   * Atualizar projeto de inspiração existente (apenas admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        description: z.string().optional(),
        concept: z.string().optional(),
        area: z.number().optional(),
        storeCount: z.number().optional(),
        parkingSpaces: z.number().optional(),
        floors: z.number().optional(),
        year: z.number().optional(),
        architect: z.string().optional(),
        developer: z.string().optional(),
        anchors: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        category: z.enum(["strip_mall", "open_mall", "shopping_center", "neighborhood_center"]).optional(),
        segment: z.enum(["popular", "medio", "alto_padrao"]).optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        images: z.array(z.string()).optional(),
        mainImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem atualizar projetos de inspiração");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const updateData: Partial<InsertInspirationProject> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.concept !== undefined) updateData.concept = input.concept;
      if (input.area !== undefined) updateData.area = input.area;
      if (input.storeCount !== undefined) updateData.storeCount = input.storeCount;
      if (input.parkingSpaces !== undefined) updateData.parkingSpaces = input.parkingSpaces;
      if (input.floors !== undefined) updateData.floors = input.floors;
      if (input.year !== undefined) updateData.year = input.year;
      if (input.architect !== undefined) updateData.architect = input.architect;
      if (input.developer !== undefined) updateData.developer = input.developer;
      if (input.anchors !== undefined) updateData.anchors = JSON.stringify(input.anchors);
      if (input.features !== undefined) updateData.features = JSON.stringify(input.features);
      if (input.category !== undefined) updateData.category = input.category;
      if (input.segment !== undefined) updateData.segment = input.segment;
      if (input.latitude !== undefined) updateData.latitude = input.latitude;
      if (input.longitude !== undefined) updateData.longitude = input.longitude;
      if (input.images !== undefined) updateData.images = JSON.stringify(input.images);
      if (input.mainImageUrl !== undefined) updateData.mainImageUrl = input.mainImageUrl;

      await db
        .update(inspirationProjects)
        .set(updateData)
        .where(eq(inspirationProjects.id, input.id));

      return { success: true };
    }),

  /**
   * Deletar projeto de inspiração (apenas admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem deletar projetos de inspiração");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .delete(inspirationProjects)
        .where(eq(inspirationProjects.id, input.id));

      return { success: true };
    }),

  /**
   * Buscar projetos similares com base em área e categoria
   */
  findSimilar: publicProcedure
    .input(
      z.object({
        area: z.number(),
        category: z.enum(["strip_mall", "open_mall", "shopping_center", "neighborhood_center"]).optional(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar projetos com área similar (±30%)
      const minArea = Math.floor(input.area * 0.7);
      const maxArea = Math.ceil(input.area * 1.3);

      const conditions = [
        gte(inspirationProjects.area, minArea),
        lte(inspirationProjects.area, maxArea),
      ];

      if (input.category) {
        conditions.push(eq(inspirationProjects.category, input.category));
      }

      const projects = await db
        .select()
        .from(inspirationProjects)
        .where(and(...conditions))
        .orderBy(desc(inspirationProjects.year))
        .limit(input.limit);

      return projects;
    }),
});
