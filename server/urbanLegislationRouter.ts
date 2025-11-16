import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getAddressByCEP, suggestUrbanParameters, defaultUrbanParameters } from "./urbanLegislationService";

export const urbanLegislationRouter = router({
  /**
   * Busca endereço por CEP usando ViaCEP
   */
  getAddressByCEP: publicProcedure
    .input(z.object({ cep: z.string() }))
    .query(async ({ input }) => {
      const address = await getAddressByCEP(input.cep);
      
      if (!address) {
        return { success: false, message: "CEP não encontrado" };
      }
      
      return {
        success: true,
        address: {
          street: address.logradouro,
          neighborhood: address.bairro,
          city: address.localidade,
          state: address.uf,
          cep: address.cep,
        },
      };
    }),

  /**
   * Busca parâmetros urbanísticos por cidade
   */
  getParametersByCity: publicProcedure
    .input(z.object({
      city: z.string(),
      state: z.string(),
    }))
    .query(async ({ input }) => {
      // Buscar no banco de dados
      const legislation = await db.getUrbanLegislationByCity(input.city, input.state);
      
      if (legislation.length > 0) {
        return {
          success: true,
          source: "database",
          parameters: legislation,
        };
      }
      
      // Se não encontrou no banco, verificar dados padrão
      if (defaultUrbanParameters[input.city]) {
        return {
          success: true,
          source: "default",
          parameters: defaultUrbanParameters[input.city].zones,
        };
      }
      
      // Sugerir parâmetros baseados em IA
      const suggested = suggestUrbanParameters(input.city, input.state);
      return {
        success: true,
        source: "ai_suggested",
        parameters: [suggested],
      };
    }),

  /**
   * Busca parâmetros urbanísticos por CEP
   */
  getParametersByCEP: publicProcedure
    .input(z.object({ cep: z.string() }))
    .query(async ({ input }) => {
      // Primeiro buscar o endereço
      const address = await getAddressByCEP(input.cep);
      
      if (!address) {
        return { success: false, message: "CEP não encontrado" };
      }
      
      // Buscar parâmetros para a cidade
      const legislation = await db.getUrbanLegislationByCity(address.localidade, address.uf);
      
      if (legislation.length > 0) {
        return {
          success: true,
          source: "database",
          city: address.localidade,
          state: address.uf,
          parameters: legislation,
        };
      }
      
      // Verificar dados padrão
      if (defaultUrbanParameters[address.localidade]) {
        return {
          success: true,
          source: "default",
          city: address.localidade,
          state: address.uf,
          parameters: defaultUrbanParameters[address.localidade].zones,
        };
      }
      
      // Sugerir parâmetros
      const suggested = suggestUrbanParameters(address.localidade, address.uf);
      return {
        success: true,
        source: "ai_suggested",
        city: address.localidade,
        state: address.uf,
        parameters: [suggested],
      };
    }),

  /**
   * Adiciona nova legislação urbanística (contribuição de usuário)
   */
  addLegislation: protectedProcedure
    .input(z.object({
      city: z.string(),
      state: z.string(),
      zone: z.string().optional(),
      zoneDescription: z.string().optional(),
      taxaOcupacaoMax: z.number().optional(),
      coeficienteAproveitamentoMax: z.number().optional(),
      gabaritoMax: z.number().optional(),
      recuoFrontalMin: z.number().optional(),
      recuoLateralMin: z.number().optional(),
      recuoFundosMin: z.number().optional(),
      areaPermeavelMin: z.number().optional(),
      vagasPorM2: z.number().optional(),
      usosPermitidos: z.array(z.string()).optional(),
      restricoes: z.array(z.string()).optional(),
      leiReferencia: z.string().optional(),
      linkLegislacao: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createUrbanLegislation({
        ...input,
        usosPermitidos: input.usosPermitidos ? JSON.stringify(input.usosPermitidos) : null,
        restricoes: input.restricoes ? JSON.stringify(input.restricoes) : null,
        source: "user_contributed",
        createdBy: ctx.user.id,
        verifiedBy: null,
        verifiedAt: null,
      });
      
      return { success: true, id: result };
    }),

  /**
   * Lista todas as cidades com legislação cadastrada
   */
  listCities: publicProcedure.query(async () => {
    const cities = await db.getCitiesWithLegislation();
    
    // Adicionar cidades dos dados padrão
    const defaultCities = Object.values(defaultUrbanParameters).map(p => ({
      city: p.city,
      state: p.state,
    }));
    
    // Combinar e remover duplicatas
    const allCities = [...cities, ...defaultCities];
    const uniqueCities = allCities.filter((city, index, self) =>
      index === self.findIndex((c) => c.city === city.city && c.state === city.state)
    );
    
    return uniqueCities;
  }),

  /**
   * Compara parâmetros do projeto com legislação
   */
  compareWithLegislation: publicProcedure
    .input(z.object({
      city: z.string(),
      state: z.string(),
      projectParams: z.object({
        taxaOcupacao: z.number(),
        coeficienteAproveitamento: z.number(),
        recuoFrontal: z.number().optional(),
        recuoLateral: z.number().optional(),
        recuoFundos: z.number().optional(),
      }),
    }))
    .query(async ({ input }) => {
      // Buscar legislação
      const legislation = await db.getUrbanLegislationByCity(input.city, input.state);
      
      let params: any;
      if (legislation.length > 0) {
        params = legislation[0];
      } else if (defaultUrbanParameters[input.city]) {
        params = defaultUrbanParameters[input.city].zones[0];
      } else {
        params = suggestUrbanParameters(input.city, input.state);
      }
      
      // Comparar parâmetros
      const issues: Array<{ parameter: string; message: string; severity: "error" | "warning" }> = [];
      
      if (input.projectParams.taxaOcupacao > params.taxaOcupacaoMax) {
        issues.push({
          parameter: "taxaOcupacao",
          message: `Taxa de ocupação (${input.projectParams.taxaOcupacao}%) excede o máximo permitido (${params.taxaOcupacaoMax}%)`,
          severity: "error",
        });
      }
      
      if (input.projectParams.coeficienteAproveitamento > params.coeficienteAproveitamentoMax / 100) {
        issues.push({
          parameter: "coeficienteAproveitamento",
          message: `Coeficiente de aproveitamento (${input.projectParams.coeficienteAproveitamento}) excede o máximo permitido (${params.coeficienteAproveitamentoMax / 100})`,
          severity: "error",
        });
      }
      
      if (input.projectParams.recuoFrontal && input.projectParams.recuoFrontal < params.recuoFrontalMin) {
        issues.push({
          parameter: "recuoFrontal",
          message: `Recuo frontal (${input.projectParams.recuoFrontal}m) é menor que o mínimo exigido (${params.recuoFrontalMin}m)`,
          severity: "error",
        });
      }
      
      if (input.projectParams.recuoLateral && input.projectParams.recuoLateral < params.recuoLateralMin) {
        issues.push({
          parameter: "recuoLateral",
          message: `Recuo lateral (${input.projectParams.recuoLateral}m) é menor que o mínimo exigido (${params.recuoLateralMin}m)`,
          severity: "error",
        });
      }
      
      if (input.projectParams.recuoFundos && input.projectParams.recuoFundos < params.recuoFundosMin) {
        issues.push({
          parameter: "recuoFundos",
          message: `Recuo de fundos (${input.projectParams.recuoFundos}m) é menor que o mínimo exigido (${params.recuoFundosMin}m)`,
          severity: "error",
        });
      }
      
      return {
        compliant: issues.length === 0,
        issues,
        legislation: params,
      };
    }),
});
