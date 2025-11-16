import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { parseKMZ } from "./kmzParser";
import { generateProjectReport } from "./pdfGenerator";
import { calculateFinancialAnalysis, DEFAULT_FINANCIAL_PARAMS } from "./financialCalculator";
import { calcularAnaliseFinanceiraAvancada } from "./services/advancedFinancialService";
import { generateProfessionalPDF } from "./services/professionalPdfService";

export const projectRouter = router({
  // Listar todos os projetos do usuário
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getProjectsByUserId(ctx.user.id);
  }),

  // Obter um projeto específico
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.id);
      
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
      }
      
      if (project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      return project;
    }),

  // Criar novo projeto
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        description: z.string().optional(),
        briefing: z.string().optional(),
        address: z.string().optional(),
        area: z.number().min(1, "Área deve ser maior que 0"),
        width: z.number().optional(),
        length: z.number().optional(),
        taxaOcupacao: z.number().optional(),
        coeficienteAproveitamento: z.number().optional(),
        recuoFrontal: z.number().optional(),
        recuoLateral: z.number().optional(),
        recuoFundos: z.number().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        polygonCoordinates: z.string().optional(),
        pricePerSqm: z.number().optional(), // Preço por m² em centavos
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectId = await db.createProject({
        ...input,
        userId: ctx.user.id,
        status: "draft",
      });
      
      return { success: true, projectId };
    }),

  // Atualizar projeto
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        briefing: z.string().optional(),
        address: z.string().optional(),
        area: z.number().optional(),
        width: z.number().optional(),
        length: z.number().optional(),
        taxaOcupacao: z.number().optional(),
        coeficienteAproveitamento: z.number().optional(),
        recuoFrontal: z.number().optional(),
        recuoLateral: z.number().optional(),
        recuoFundos: z.number().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        pricePerSqm: z.number().optional(), // Preço por m² em centavos
        status: z.enum(["draft", "analyzing", "completed"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      
      const project = await db.getProjectById(id);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      await db.updateProject(id, data);
      
      return { success: true };
    }),

  // Deletar projeto
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.id);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      await db.deleteProject(input.id);
      
      return { success: true };
    }),

  // Analisar terreno com IA
  analyze: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      // Atualizar status para "analyzing"
      await db.updateProject(input.projectId, { status: "analyzing" });
      
      try {
        // Preparar dados para a IA
        const terrainData = {
          area: project.area,
          width: project.width,
          length: project.length,
          taxaOcupacao: project.taxaOcupacao,
          coeficienteAproveitamento: project.coeficienteAproveitamento,
          recuoFrontal: project.recuoFrontal,
          recuoLateral: project.recuoLateral,
          recuoFundos: project.recuoFundos,
        };
        
        // Chamar IA para análise
        const briefingSection = project.briefing 
          ? `\n\nBRIEFING DO PROJETO:\n${project.briefing}\n\nConsidere este briefing ao fazer suas recomendações de layout, estilo arquitetônico e distribuição de espaços.`
          : '';
        
        const prompt = `Você é um especialista em planejamento urbano e projetos de strip malls (centros comerciais de varejo).

Analise o seguinte terreno e forneça um estudo de massa e volumetria detalhado para um projeto de strip mall:

Dados do Terreno:
- Área total: ${terrainData.area} m²
${terrainData.width ? `- Largura: ${terrainData.width} m` : ""}
${terrainData.length ? `- Comprimento: ${terrainData.length} m` : ""}

Parâmetros Urbanísticos:
${terrainData.taxaOcupacao ? `- Taxa de Ocupação: ${terrainData.taxaOcupacao}%` : "- Taxa de Ocupação: Não especificada (use 70% como padrão)"}
${terrainData.coeficienteAproveitamento ? `- Coeficiente de Aproveitamento: ${terrainData.coeficienteAproveitamento / 100}` : "- Coeficiente de Aproveitamento: Não especificado (use 2.0 como padrão)"}
${terrainData.recuoFrontal ? `- Recuo Frontal: ${terrainData.recuoFrontal} m` : "- Recuo Frontal: 5m (padrão)"}
${terrainData.recuoLateral ? `- Recuo Lateral: ${terrainData.recuoLateral} m` : "- Recuo Lateral: 3m (padrão)"}
${terrainData.recuoFundos ? `- Recuo de Fundos: ${terrainData.recuoFundos} m` : "- Recuo de Fundos: 3m (padrão)"}${briefingSection}

Forneça uma análise completa incluindo:
1. Área máxima construída permitida
2. Área ocupada no térreo
3. Número recomendado de lojas (considere lojas de 50-150m² cada)
4. Número de vagas de estacionamento (1 vaga para cada 25m² de área construída)
5. Dimensões recomendadas da volumetria (largura, comprimento, altura)
6. Sugestões de layout e distribuição
7. Recomendações de projeto

Responda APENAS com um JSON válido no seguinte formato:
{
  "areaMaximaConstruida": número,
  "areaOcupada": número,
  "numeroLojas": número,
  "vagasEstacionamento": número,
  "volumetriaWidth": número,
  "volumetriaLength": número,
  "volumetriaHeight": número,
  "layoutDescription": "descrição detalhada do layout sugerido",
  "aiSuggestions": "sugestões e recomendações detalhadas para o projeto"
}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em planejamento urbano e projetos de strip malls. Sempre responda com JSON válido.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "volumetric_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  areaMaximaConstruida: { type: "integer", description: "Área máxima construída em m²" },
                  areaOcupada: { type: "integer", description: "Área ocupada no térreo em m²" },
                  numeroLojas: { type: "integer", description: "Número recomendado de lojas" },
                  vagasEstacionamento: { type: "integer", description: "Número de vagas de estacionamento" },
                  volumetriaWidth: { type: "integer", description: "Largura da volumetria em metros" },
                  volumetriaLength: { type: "integer", description: "Comprimento da volumetria em metros" },
                  volumetriaHeight: { type: "integer", description: "Altura da volumetria em metros" },
                  layoutDescription: { type: "string", description: "Descrição detalhada do layout" },
                  aiSuggestions: { type: "string", description: "Sugestões e recomendações" },
                },
                required: [
                  "areaMaximaConstruida",
                  "areaOcupada",
                  "numeroLojas",
                  "vagasEstacionamento",
                  "volumetriaWidth",
                  "volumetriaLength",
                  "volumetriaHeight",
                  "layoutDescription",
                  "aiSuggestions",
                ],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = response.choices[0].message.content;
        const analysisData = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        
        // Salvar análise no banco
        await db.createAnalysis({
          projectId: input.projectId,
          ...analysisData,
        });
        
        // Atualizar status para "completed"
        await db.updateProject(input.projectId, { status: "completed" });
        
        return { success: true, analysis: analysisData };
      } catch (error) {
        // Em caso de erro, reverter status
        await db.updateProject(input.projectId, { status: "draft" });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao analisar terreno",
        });
      }
    }),

  // Obter análises de um projeto
  getAnalyses: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      return db.getAnalysesByProjectId(input.projectId);
    }),

  // Obter última análise de um projeto
  getLatestAnalysis: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      return db.getLatestAnalysis(input.projectId);
    }),

  // Processar arquivo KMZ e extrair dados do terreno
  parseKMZ: protectedProcedure
    .input(z.object({ base64Data: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Converter base64 para Buffer
        const buffer = Buffer.from(input.base64Data, "base64");
        
        // Processar KMZ
        const data = await parseKMZ(buffer);
        
        return {
          success: true,
          data: {
            area: data.area,
            latitude: data.centerLat.toString(),
            longitude: data.centerLng.toString(),
            polygonCoordinates: JSON.stringify(data.coordinates),
            name: data.name,
            description: data.description,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Erro ao processar arquivo KMZ",
        });
      }
    }),

  // Visualizar prévia do relatório em PDF (retorna base64)
  previewPDF: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        // Buscar dados do projeto
        const project = await db.getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        
        // Buscar análise mais recente
        const analysis = await db.getLatestAnalysis(input.projectId);
        
        // Buscar todas as imagens geradas
        const images = await db.getGeneratedImagesByProjectId(input.projectId);
        
        // Preparar dados para o relatório
        const reportData = {
          project: {
            id: project.id,
            name: project.name,
            address: project.address || "Não informado",
            totalArea: project.area,
            briefing: project.briefing,
            pricePerSqm: project.pricePerSqm,
            latitude: project.latitude ? parseFloat(project.latitude) : null,
            longitude: project.longitude ? parseFloat(project.longitude) : null,
            createdAt: project.createdAt,
          },
          analysis: analysis ? {
            buildableArea: analysis.areaMaximaConstruida,
            numberOfStores: analysis.numeroLojas,
            parkingSpaces: analysis.vagasEstacionamento,
            feasibilityScore: 85,
            aiAnalysis: analysis.aiSuggestions,
          } : null,
          images: images.map((img: any) => ({
            id: img.id,
            type: img.type,
            imageUrl: img.imageUrl,
          })),
        };
        
        // Gerar PDF
        const pdfBuffer = await generateProjectReport(reportData);
        
        // Retornar PDF como base64 para preview no navegador
        return {
          success: true,
          pdfBase64: pdfBuffer.toString('base64'),
          fileName: `relatorio-${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
        };
      } catch (error) {
        console.error("Erro ao gerar preview do PDF:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar prévia do relatório",
        });
      }
    }),

  // Exportar relatório técnico em PDF
  exportPDF: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Buscar dados do projeto
        const project = await db.getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        
        // Buscar análise mais recente
        const analysis = await db.getLatestAnalysis(input.projectId);
        
        // Buscar todas as imagens geradas
        const images = await db.getGeneratedImagesByProjectId(input.projectId);
        
        // Preparar dados para o relatório
        const reportData = {
          project: {
            id: project.id,
            name: project.name,
            address: project.address || "Não informado",
            totalArea: project.area,
            briefing: project.briefing,
            pricePerSqm: project.pricePerSqm,
            latitude: project.latitude ? parseFloat(project.latitude) : null,
            longitude: project.longitude ? parseFloat(project.longitude) : null,
            createdAt: project.createdAt,
          },
          analysis: analysis ? {
            buildableArea: analysis.areaMaximaConstruida,
            numberOfStores: analysis.numeroLojas,
            parkingSpaces: analysis.vagasEstacionamento,
            feasibilityScore: 85, // Calcular score baseado nos dados
            aiAnalysis: analysis.aiSuggestions,
          } : null,
          images: images.map((img: any) => ({
            id: img.id,
            type: img.type,
            imageUrl: img.imageUrl,
          })),
        };
        
        // Gerar PDF
        const pdfBuffer = await generateProjectReport(reportData);
        
        // Upload do PDF para S3
        const fileName = `relatorio-${project.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(
          `reports/${fileName}`,
          pdfBuffer,
          "application/pdf"
        );
        
        return {
          success: true,
          url,
          fileName,
        };
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar relatório PDF",
        });
      }
    }),

  // Calcular análise de viabilidade financeira
  calculateFinancialAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        // Parâmetros opcionais (usa defaults se não fornecidos)
        landCost: z.number().optional(),
        constructionCostPerSqm: z.number().optional(),
        averageRentPerSqm: z.number().optional(),
        vacancyRate: z.number().optional(),
        annualRentIncrease: z.number().optional(),
        operationalCostRate: z.number().optional(),
        propertyTaxRate: z.number().optional(),
        maintenanceRate: z.number().optional(),
        discountRate: z.number().optional(),
        projectionYears: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Buscar última análise
      const analysis = await db.getLatestAnalysis(input.projectId);
      
      if (!analysis) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Nenhuma análise disponível. Execute uma análise volumétrica primeiro." 
        });
      }

      // Usar parâmetros fornecidos ou defaults
      const financialInputs = {
        landCost: input.landCost || (project.area * 1000), // R$ 1.000/m² default
        constructionCostPerSqm: input.constructionCostPerSqm || DEFAULT_FINANCIAL_PARAMS.constructionCostPerSqm,
        buildableArea: analysis.areaMaximaConstruida || 0,
        numberOfStores: analysis.numeroLojas || 0,
        parkingSpaces: analysis.vagasEstacionamento || 0,
        averageRentPerSqm: input.averageRentPerSqm || DEFAULT_FINANCIAL_PARAMS.averageRentPerSqm,
        vacancyRate: input.vacancyRate || DEFAULT_FINANCIAL_PARAMS.vacancyRate,
        annualRentIncrease: input.annualRentIncrease || DEFAULT_FINANCIAL_PARAMS.annualRentIncrease,
        operationalCostRate: input.operationalCostRate || DEFAULT_FINANCIAL_PARAMS.operationalCostRate,
        propertyTaxRate: input.propertyTaxRate || DEFAULT_FINANCIAL_PARAMS.propertyTaxRate,
        maintenanceRate: input.maintenanceRate || DEFAULT_FINANCIAL_PARAMS.maintenanceRate,
        discountRate: input.discountRate || DEFAULT_FINANCIAL_PARAMS.discountRate,
        projectionYears: input.projectionYears || DEFAULT_FINANCIAL_PARAMS.projectionYears,
      };

      const financialAnalysis = calculateFinancialAnalysis(financialInputs);
      
      return {
        ...financialAnalysis,
        inputs: financialInputs,
      };
    }),

  // Calcular análise financeira avançada com TIR, VPL e projeções
  calculateAdvancedFinancial: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        investimentoInicial: z.number(),
        receitaMensalAluguel: z.number(),
        taxaVacancia: z.number(),
        custoOperacionalMensal: z.number(),
        tipoFinanciamento: z.enum(['proprio', 'bancario', 'misto']),
        percentualFinanciado: z.number().optional(),
        taxaJurosAnual: z.number().optional(),
        prazoFinanciamentoMeses: z.number().optional(),
        taxaDesconto: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verificar se o projeto pertence ao usuário
      const project = await db.getProjectById(input.projectId);
      
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
      }
      
      if (project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Calcular análise financeira avançada
      const resultado = calcularAnaliseFinanceiraAvancada(
        input.investimentoInicial,
        input.receitaMensalAluguel,
        input.taxaVacancia,
        input.custoOperacionalMensal,
        input.tipoFinanciamento,
        input.percentualFinanciado || 0,
        input.taxaJurosAnual || 0,
        input.prazoFinanciamentoMeses || 0,
        input.taxaDesconto || 1000
      );

      return resultado;
    }),

  // Gerar PDF profissional no estilo Piazza Nicomedes
  generateProfessionalPDF: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }
        
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // Obter análise e imagens
        const analysis = await db.getLatestAnalysis(input.projectId);
        const images = await db.getGeneratedImagesByProjectId(input.projectId);

        // Preparar dados do projeto
        const projectData = {
          id: project.id,
          name: project.name,
          address: project.address || '',
          areaTotal: project.area,
          taxaOcupacao: project.taxaOcupacao || 0.7,
          coeficienteAproveitamento: project.coeficienteAproveitamento || 1.5,
          numeroLojas: analysis?.numeroLojas || 0,
          vagasEstacionamento: analysis?.vagasEstacionamento || 0,
          images: images.map((img: any) => ({
            url: img.imageUrl,
            type: img.type,
          })),
          analysis: analysis ? {
            areaOcupada: analysis.areaOcupada || 0,
            areaConstruida: analysis.areaMaximaConstruida || 0,
            areaPrivativa: (analysis.areaMaximaConstruida || 0) * 0.7, // 70% área privativa
            areaComum: (analysis.areaMaximaConstruida || 0) * 0.3, // 30% área comum
          } : undefined,
        };

        // Gerar PDF profissional
        const pdfBuffer = await generateProfessionalPDF(projectData);
        
        // Upload do PDF para S3
        const fileName = `estudo-profissional-${project.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(
          `reports/${fileName}`,
          pdfBuffer,
          "application/pdf"
        );
        
        return {
          success: true,
          url,
          fileName,
        };
      } catch (error) {
        console.error("Erro ao gerar PDF profissional:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar PDF profissional",
        });
      }
    }),
});
