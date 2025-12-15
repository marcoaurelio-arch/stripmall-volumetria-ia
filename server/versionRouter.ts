import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { drizzle } from "drizzle-orm/mysql2";
import { analysisVersions, analyses, projects } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { calculateFinancialAnalysis, DEFAULT_FINANCIAL_PARAMS } from "./financialCalculator";

async function getDb() {
  return drizzle(process.env.DATABASE_URL!);
}

export const versionRouter = router({
  // Listar todas as versões de um projeto
  listVersions: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Verificar acesso ao projeto
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      const versions = await db
        .select()
        .from(analysisVersions)
        .where(eq(analysisVersions.projectId, input.projectId))
        .orderBy(desc(analysisVersions.versionNumber));
      
      return versions;
    }),

  // Obter uma versão específica
  getVersion: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      const version = await db
        .select()
        .from(analysisVersions)
        .where(eq(analysisVersions.id, input.versionId))
        .limit(1);
      
      if (!version[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Versão não encontrada" });
      }
      
      // Verificar acesso
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, version[0].projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      return {
        ...version[0],
        projectSnapshot: JSON.parse(version[0].projectSnapshot || "{}"),
      };
    }),

  // Comparar duas versões
  compareVersions: protectedProcedure
    .input(z.object({
      versionId1: z.number(),
      versionId2: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      
      const [v1, v2] = await Promise.all([
        db.select().from(analysisVersions).where(eq(analysisVersions.id, input.versionId1)).limit(1),
        db.select().from(analysisVersions).where(eq(analysisVersions.id, input.versionId2)).limit(1),
      ]);
      
      if (!v1[0] || !v2[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Versão não encontrada" });
      }
      
      // Verificar que são do mesmo projeto
      if (v1[0].projectId !== v2[0].projectId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Versões devem ser do mesmo projeto" });
      }
      
      // Verificar acesso
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, v1[0].projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      // Calcular diferenças
      const differences = {
        areaMaximaConstruida: {
          v1: v1[0].areaMaximaConstruida || 0,
          v2: v2[0].areaMaximaConstruida || 0,
          diff: (v2[0].areaMaximaConstruida || 0) - (v1[0].areaMaximaConstruida || 0),
          percentChange: v1[0].areaMaximaConstruida 
            ? (((v2[0].areaMaximaConstruida || 0) - v1[0].areaMaximaConstruida) / v1[0].areaMaximaConstruida) * 100 
            : 0,
        },
        numeroLojas: {
          v1: v1[0].numeroLojas || 0,
          v2: v2[0].numeroLojas || 0,
          diff: (v2[0].numeroLojas || 0) - (v1[0].numeroLojas || 0),
          percentChange: v1[0].numeroLojas 
            ? (((v2[0].numeroLojas || 0) - v1[0].numeroLojas) / v1[0].numeroLojas) * 100 
            : 0,
        },
        vagasEstacionamento: {
          v1: v1[0].vagasEstacionamento || 0,
          v2: v2[0].vagasEstacionamento || 0,
          diff: (v2[0].vagasEstacionamento || 0) - (v1[0].vagasEstacionamento || 0),
          percentChange: v1[0].vagasEstacionamento 
            ? (((v2[0].vagasEstacionamento || 0) - v1[0].vagasEstacionamento) / v1[0].vagasEstacionamento) * 100 
            : 0,
        },
        custoEstimado: {
          v1: v1[0].custoEstimado || 0,
          v2: v2[0].custoEstimado || 0,
          diff: (v2[0].custoEstimado || 0) - (v1[0].custoEstimado || 0),
          percentChange: v1[0].custoEstimado 
            ? (((v2[0].custoEstimado || 0) - v1[0].custoEstimado) / v1[0].custoEstimado) * 100 
            : 0,
        },
        roiEstimado: {
          v1: (v1[0].roiEstimado || 0) / 100,
          v2: (v2[0].roiEstimado || 0) / 100,
          diff: ((v2[0].roiEstimado || 0) - (v1[0].roiEstimado || 0)) / 100,
          percentChange: 0, // ROI já é percentual
        },
        taxaOcupacao: {
          v1: v1[0].taxaOcupacao || 0,
          v2: v2[0].taxaOcupacao || 0,
          diff: (v2[0].taxaOcupacao || 0) - (v1[0].taxaOcupacao || 0),
          percentChange: 0,
        },
      };
      
      return {
        version1: {
          ...v1[0],
          projectSnapshot: JSON.parse(v1[0].projectSnapshot || "{}"),
        },
        version2: {
          ...v2[0],
          projectSnapshot: JSON.parse(v2[0].projectSnapshot || "{}"),
        },
        differences,
      };
    }),

  // Salvar versão manualmente (com label)
  saveVersion: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      label: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Verificar acesso ao projeto
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      // Buscar última análise
      const latestAnalysis = await db
        .select()
        .from(analyses)
        .where(eq(analyses.projectId, input.projectId))
        .orderBy(desc(analyses.createdAt))
        .limit(1);
      
      if (!latestAnalysis[0]) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Nenhuma análise encontrada. Execute uma análise primeiro." 
        });
      }
      
      // Buscar última versão para determinar número
      const lastVersion = await db
        .select()
        .from(analysisVersions)
        .where(eq(analysisVersions.projectId, input.projectId))
        .orderBy(desc(analysisVersions.versionNumber))
        .limit(1);
      
      const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1;
      
      // Calcular dados financeiros
      let custoEstimado = 0;
      let roiEstimado = 0;
      let paybackMeses = 0;
      
      try {
        const financialInputs = {
          landCost: project[0].area * 1000,
          constructionCostPerSqm: DEFAULT_FINANCIAL_PARAMS.constructionCostPerSqm,
          buildableArea: latestAnalysis[0].areaMaximaConstruida || 0,
          numberOfStores: latestAnalysis[0].numeroLojas || 0,
          parkingSpaces: latestAnalysis[0].vagasEstacionamento || 0,
          averageRentPerSqm: DEFAULT_FINANCIAL_PARAMS.averageRentPerSqm,
          vacancyRate: DEFAULT_FINANCIAL_PARAMS.vacancyRate,
          annualRentIncrease: DEFAULT_FINANCIAL_PARAMS.annualRentIncrease,
          operationalCostRate: DEFAULT_FINANCIAL_PARAMS.operationalCostRate,
          propertyTaxRate: DEFAULT_FINANCIAL_PARAMS.propertyTaxRate,
          maintenanceRate: DEFAULT_FINANCIAL_PARAMS.maintenanceRate,
          discountRate: DEFAULT_FINANCIAL_PARAMS.discountRate,
          projectionYears: DEFAULT_FINANCIAL_PARAMS.projectionYears,
        };
        const financial = calculateFinancialAnalysis(financialInputs);
        custoEstimado = financial.totalInvestment;
        roiEstimado = Math.round(financial.annualYield * 100);
        paybackMeses = Math.round(financial.paybackYears * 12);
      } catch (e) {
        console.warn("Não foi possível calcular dados financeiros para versão");
      }
      
      // Criar snapshot do projeto
      const projectSnapshot = JSON.stringify({
        name: project[0].name,
        area: project[0].area,
        width: project[0].width,
        length: project[0].length,
        address: project[0].address,
        taxaOcupacao: project[0].taxaOcupacao,
        coeficienteAproveitamento: project[0].coeficienteAproveitamento,
        recuoFrontal: project[0].recuoFrontal,
        recuoLateral: project[0].recuoLateral,
        recuoFundos: project[0].recuoFundos,
      });
      
      // Determinar mudanças em relação à versão anterior
      let changesFromPrevious = "";
      if (lastVersion[0]) {
        const changes: string[] = [];
        if (latestAnalysis[0].areaMaximaConstruida !== lastVersion[0].areaMaximaConstruida) {
          changes.push(`Área construída: ${lastVersion[0].areaMaximaConstruida} → ${latestAnalysis[0].areaMaximaConstruida} m²`);
        }
        if (latestAnalysis[0].numeroLojas !== lastVersion[0].numeroLojas) {
          changes.push(`Lojas: ${lastVersion[0].numeroLojas} → ${latestAnalysis[0].numeroLojas}`);
        }
        if (latestAnalysis[0].vagasEstacionamento !== lastVersion[0].vagasEstacionamento) {
          changes.push(`Vagas: ${lastVersion[0].vagasEstacionamento} → ${latestAnalysis[0].vagasEstacionamento}`);
        }
        changesFromPrevious = changes.join("; ");
      }
      
      // Inserir versão
      await db.insert(analysisVersions).values({
        projectId: input.projectId,
        analysisId: latestAnalysis[0].id,
        versionNumber: nextVersionNumber,
        versionLabel: input.label || `Versão ${nextVersionNumber}`,
        projectSnapshot,
        areaMaximaConstruida: latestAnalysis[0].areaMaximaConstruida,
        areaOcupada: latestAnalysis[0].areaOcupada,
        numeroLojas: latestAnalysis[0].numeroLojas,
        vagasEstacionamento: latestAnalysis[0].vagasEstacionamento,
        volumetriaWidth: latestAnalysis[0].volumetriaWidth,
        volumetriaLength: latestAnalysis[0].volumetriaLength,
        volumetriaHeight: latestAnalysis[0].volumetriaHeight,
        aiSuggestions: latestAnalysis[0].aiSuggestions,
        layoutDescription: latestAnalysis[0].layoutDescription,
        custoEstimado,
        roiEstimado,
        paybackMeses,
        taxaOcupacao: project[0].taxaOcupacao,
        coeficienteAproveitamento: project[0].coeficienteAproveitamento,
        recuoFrontal: project[0].recuoFrontal,
        recuoLateral: project[0].recuoLateral,
        recuoFundos: project[0].recuoFundos,
        notes: input.notes,
        changesFromPrevious,
        createdBy: ctx.user.id,
      });
      
      return {
        success: true,
        versionNumber: nextVersionNumber,
        message: `Versão ${nextVersionNumber} salva com sucesso!`,
      };
    }),

  // Atualizar label/notas de uma versão
  updateVersion: protectedProcedure
    .input(z.object({
      versionId: z.number(),
      label: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const version = await db
        .select()
        .from(analysisVersions)
        .where(eq(analysisVersions.id, input.versionId))
        .limit(1);
      
      if (!version[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Versão não encontrada" });
      }
      
      // Verificar acesso
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, version[0].projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      const updateData: Record<string, string> = {};
      if (input.label !== undefined) updateData.versionLabel = input.label;
      if (input.notes !== undefined) updateData.notes = input.notes;
      
      if (Object.keys(updateData).length > 0) {
        await db
          .update(analysisVersions)
          .set(updateData)
          .where(eq(analysisVersions.id, input.versionId));
      }
      
      return { success: true };
    }),

  // Deletar uma versão
  deleteVersion: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      const version = await db
        .select()
        .from(analysisVersions)
        .where(eq(analysisVersions.id, input.versionId))
        .limit(1);
      
      if (!version[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Versão não encontrada" });
      }
      
      // Verificar acesso
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, version[0].projectId))
        .limit(1);
      
      if (!project[0] || project[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      await db
        .delete(analysisVersions)
        .where(eq(analysisVersions.id, input.versionId));
      
      return { success: true };
    }),
});
