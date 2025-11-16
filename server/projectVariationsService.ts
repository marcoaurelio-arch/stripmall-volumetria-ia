import { invokeLLM } from "./_core/llm";

export interface ProjectConstraints {
  totalArea: number;
  buildableArea: number;
  occupancyRate: number;
  buildingCoefficient: number;
  setbackFront: number;
  setbackSide: number;
  setbackRear: number;
  minParkingSpaces: number;
  permeableAreaRequired: number;
}

export interface LayoutVariation {
  id: string;
  name: string;
  description: string;
  numberOfStores: number;
  storeConfiguration: {
    small: number; // < 50m²
    medium: number; // 50-100m²
    large: number; // > 100m²
  };
  parkingSpaces: number;
  parkingLayout: 'frontal' | 'lateral' | 'posterior' | 'misto';
  buildingOrientation: 'norte' | 'sul' | 'leste' | 'oeste';
  floors: number;
  totalBuiltArea: number;
  commercialArea: number;
  circulationArea: number;
  serviceArea: number;
  greenArea: number;
  scores: {
    efficiency: number; // 0-100: área útil / área total
    accessibility: number; // 0-100: facilidade de acesso e circulação
    flexibility: number; // 0-100: adaptabilidade do layout
    sustainability: number; // 0-100: área verde, ventilação, insolação
    cost: number; // 0-100: custo estimado (100 = mais barato)
    overall: number; // média ponderada
  };
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
}

export interface ProjectVariationsResult {
  variations: LayoutVariation[];
  bestVariation: LayoutVariation;
  comparisonMatrix: {
    criterion: string;
    variations: { [variationId: string]: number };
  }[];
}

/**
 * Gera múltiplas variações de layout otimizadas usando IA
 */
export async function generateProjectVariations(
  constraints: ProjectConstraints,
  count: number = 5
): Promise<ProjectVariationsResult> {
  try {
    // Prompt para gerar variações usando LLM com JSON schema
    const prompt = `Você é um arquiteto especializado em projetos de strip malls (centros comerciais de rua).

Dados do terreno:
- Área total: ${constraints.totalArea.toFixed(2)}m²
- Área edificável: ${constraints.buildableArea.toFixed(2)}m²
- Taxa de ocupação: ${(constraints.occupancyRate * 100).toFixed(1)}%
- Coeficiente de aproveitamento: ${constraints.buildingCoefficient.toFixed(2)}
- Recuos: frontal ${constraints.setbackFront}m, lateral ${constraints.setbackSide}m, fundos ${constraints.setbackRear}m
- Vagas mínimas: ${constraints.minParkingSpaces}
- Área permeável mínima: ${constraints.permeableAreaRequired.toFixed(2)}m²

Gere ${count} variações de layout DIFERENTES e CRIATIVAS para este strip mall, otimizadas para diferentes objetivos:
1. Máxima eficiência comercial (mais lojas pequenas)
2. Mix equilibrado (lojas de diversos tamanhos)
3. Lojas âncora (poucas lojas grandes)
4. Sustentabilidade (máxima área verde e ventilação)
5. Baixo custo de construção

Para cada variação, forneça:
- Nome descritivo e único
- Descrição detalhada da estratégia
- Número total de lojas e distribuição por tamanho
- Configuração de estacionamento
- Orientação do edifício
- Número de pavimentos
- Áreas detalhadas (construída, comercial, circulação, serviço, verde)
- Scores de 0-100 para: eficiência, acessibilidade, flexibilidade, sustentabilidade, custo
- 3-4 vantagens específicas
- 2-3 desvantagens específicas
- 2-3 recomendações de implementação

IMPORTANTE:
- Todas as variações devem respeitar os limites legais (recuos, TO, CA)
- Área construída total não pode exceder ${constraints.buildableArea.toFixed(2)}m²
- Número de vagas deve ser >= ${constraints.minParkingSpaces}
- Área verde deve ser >= ${constraints.permeableAreaRequired.toFixed(2)}m²
- Seja criativo e varie significativamente entre as opções
- Scores devem refletir trade-offs reais (ex: mais lojas = menor eficiência de circulação)`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um arquiteto especializado em strip malls. Retorne apenas JSON válido, sem texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "project_variations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              variations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    numberOfStores: { type: "integer" },
                    storeConfiguration: {
                      type: "object",
                      properties: {
                        small: { type: "integer" },
                        medium: { type: "integer" },
                        large: { type: "integer" },
                      },
                      required: ["small", "medium", "large"],
                      additionalProperties: false,
                    },
                    parkingSpaces: { type: "integer" },
                    parkingLayout: {
                      type: "string",
                      enum: ["frontal", "lateral", "posterior", "misto"],
                    },
                    buildingOrientation: {
                      type: "string",
                      enum: ["norte", "sul", "leste", "oeste"],
                    },
                    floors: { type: "integer" },
                    totalBuiltArea: { type: "number" },
                    commercialArea: { type: "number" },
                    circulationArea: { type: "number" },
                    serviceArea: { type: "number" },
                    greenArea: { type: "number" },
                    scores: {
                      type: "object",
                      properties: {
                        efficiency: { type: "integer" },
                        accessibility: { type: "integer" },
                        flexibility: { type: "integer" },
                        sustainability: { type: "integer" },
                        cost: { type: "integer" },
                        overall: { type: "integer" },
                      },
                      required: ["efficiency", "accessibility", "flexibility", "sustainability", "cost", "overall"],
                      additionalProperties: false,
                    },
                    advantages: {
                      type: "array",
                      items: { type: "string" },
                    },
                    disadvantages: {
                      type: "array",
                      items: { type: "string" },
                    },
                    recommendations: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "id",
                    "name",
                    "description",
                    "numberOfStores",
                    "storeConfiguration",
                    "parkingSpaces",
                    "parkingLayout",
                    "buildingOrientation",
                    "floors",
                    "totalBuiltArea",
                    "commercialArea",
                    "circulationArea",
                    "serviceArea",
                    "greenArea",
                    "scores",
                    "advantages",
                    "disadvantages",
                    "recommendations",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["variations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("LLM returned empty response");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr) as { variations: LayoutVariation[] };

    // Encontrar melhor variação (maior score overall)
    const bestVariation = result.variations.reduce((best, current) =>
      current.scores.overall > best.scores.overall ? current : best
    );

    // Criar matriz de comparação
    const comparisonMatrix = [
      {
        criterion: "Eficiência",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.efficiency])
        ),
      },
      {
        criterion: "Acessibilidade",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.accessibility])
        ),
      },
      {
        criterion: "Flexibilidade",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.flexibility])
        ),
      },
      {
        criterion: "Sustentabilidade",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.sustainability])
        ),
      },
      {
        criterion: "Custo",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.cost])
        ),
      },
      {
        criterion: "Geral",
        variations: Object.fromEntries(
          result.variations.map((v) => [v.id, v.scores.overall])
        ),
      },
    ];

    return {
      variations: result.variations,
      bestVariation,
      comparisonMatrix,
    };
  } catch (error) {
    console.error("[ProjectVariations] Error generating variations:", error);
    throw new Error(`Failed to generate project variations: ${error instanceof Error ? error.message : String(error)}`);
  }
}
