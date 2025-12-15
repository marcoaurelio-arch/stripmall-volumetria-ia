import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { drizzle } from "drizzle-orm/mysql2";
import { projectTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function getDb() {
  return drizzle(process.env.DATABASE_URL!);
}

export const templateRouter = router({
  // Listar todos os templates ativos
  list: publicProcedure
    .query(async () => {
      const db = await getDb();
      const templates = await db
        .select()
        .from(projectTemplates)
        .where(eq(projectTemplates.isActive, 1))
        .orderBy(projectTemplates.category);
      
      return templates;
    }),

  // Buscar template por ID
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const template = await db
        .select()
        .from(projectTemplates)
        .where(eq(projectTemplates.id, input.id))
        .limit(1);
      
      return template[0] || null;
    }),

  // Buscar templates por categoria
  getByCategory: publicProcedure
    .input(z.object({
      category: z.enum(["gastronomia", "saude", "conveniencia", "varejo", "servicos"]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const allTemplates = await db
        .select()
        .from(projectTemplates)
        .where(eq(projectTemplates.isActive, 1));
      
      // Filtrar por categoria em memória
      const templates = allTemplates.filter(t => t.category === input.category);
      
      return templates;
    }),
});
