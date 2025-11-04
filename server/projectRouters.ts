import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

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
      await db.createProject({
        ...input,
        userId: ctx.user.id,
        status: "draft",
      });
      
      return { success: true };
    }),

  // Atualizar projeto
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
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
${terrainData.recuoFundos ? `- Recuo de Fundos: ${terrainData.recuoFundos} m` : "- Recuo de Fundos: 3m (padrão)"}

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
});
