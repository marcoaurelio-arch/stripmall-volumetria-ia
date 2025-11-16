import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { financialProjections } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Router para gerenciamento de projeções financeiras salvas
 */
export const financialProjectionRouter = router({
  // Salvar uma nova projeção financeira
  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        nome: z.string().optional(),
        notas: z.string().optional(),
        investimentoInicial: z.number(),
        receitaMensalAluguel: z.number(),
        taxaVacancia: z.number(),
        custoOperacionalMensal: z.number(),
        taxaDesconto: z.number(),
        tipoFinanciamento: z.enum(['proprio', 'bancario', 'misto']),
        percentualFinanciado: z.number().optional(),
        taxaJurosAnual: z.number().optional(),
        prazoFinanciamento: z.number().optional(),
        tir: z.number(),
        vpl: z.number(),
        paybackSimples: z.number(),
        paybackDescontado: z.number(),
        fluxoCaixaAnual: z.string(), // JSON serializado
        analiseSensibilidade: z.string().optional(), // JSON serializado
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Inserir projeção no banco
      const result = await db.insert(financialProjections).values({
        projectId: input.projectId,
        nome: input.nome || `Cenário ${new Date().toLocaleString('pt-BR')}`,
        notas: input.notas,
        investimentoInicial: input.investimentoInicial,
        receitaMensalAluguel: input.receitaMensalAluguel,
        taxaVacancia: input.taxaVacancia,
        custoOperacionalMensal: input.custoOperacionalMensal,
        taxaDesconto: input.taxaDesconto,
        tipoFinanciamento: input.tipoFinanciamento,
        percentualFinanciado: input.percentualFinanciado,
        taxaJurosAnual: input.taxaJurosAnual,
        prazoFinanciamento: input.prazoFinanciamento,
        tir: input.tir,
        vpl: input.vpl,
        paybackSimples: input.paybackSimples,
        paybackDescontado: input.paybackDescontado,
        fluxoCaixaAnual: input.fluxoCaixaAnual,
        analiseSensibilidade: input.analiseSensibilidade,
      });

      return {
        success: true,
        id: Number((result as any).insertId || 0),
      };
    }),

  // Listar todas as projeções de um projeto
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const projections = await db
        .select()
        .from(financialProjections)
        .where(eq(financialProjections.projectId, input.projectId))
        .orderBy(desc(financialProjections.createdAt));

      return projections;
    }),

  // Obter uma projeção específica
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const result = await db
        .select()
        .from(financialProjections)
        .where(eq(financialProjections.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projeção não encontrada",
        });
      }

      return result[0];
    }),

  // Deletar uma projeção
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .delete(financialProjections)
        .where(eq(financialProjections.id, input.id));

      return { success: true };
    }),

  // Atualizar nome e notas de uma projeção
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const updateData: Record<string, string> = {};
      if (input.nome !== undefined) updateData.nome = input.nome;
      if (input.notas !== undefined) updateData.notas = input.notas;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(financialProjections)
          .set(updateData)
          .where(eq(financialProjections.id, input.id));
      }

      return { success: true };
    }),
});
