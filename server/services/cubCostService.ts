/**
 * Serviço de integração com tabelas CUB (Custo Unitário Básico)
 * e cálculo de custos reais de construção
 */

// Tabela CUB simplificada por região e tipo de construção (valores em R$/m² - 2024)
// Fonte: Sinduscon regionais
const CUB_TABLE = {
  // Região Sul
  'RS': {
    'comercial_padrao': 2450.00,
    'comercial_alto': 3200.00,
    'industrial_padrao': 1850.00,
    'shopping_center': 3800.00,
  },
  'SC': {
    'comercial_padrao': 2380.00,
    'comercial_alto': 3100.00,
    'industrial_padrao': 1800.00,
    'shopping_center': 3700.00,
  },
  'PR': {
    'comercial_padrao': 2420.00,
    'comercial_alto': 3150.00,
    'industrial_padrao': 1820.00,
    'shopping_center': 3750.00,
  },
  // Região Sudeste
  'SP': {
    'comercial_padrao': 2680.00,
    'comercial_alto': 3500.00,
    'industrial_padrao': 2000.00,
    'shopping_center': 4100.00,
  },
  'RJ': {
    'comercial_padrao': 2720.00,
    'comercial_alto': 3550.00,
    'industrial_padrao': 2050.00,
    'shopping_center': 4150.00,
  },
  'MG': {
    'comercial_padrao': 2350.00,
    'comercial_alto': 3050.00,
    'industrial_padrao': 1750.00,
    'shopping_center': 3600.00,
  },
  'ES': {
    'comercial_padrao': 2400.00,
    'comercial_alto': 3100.00,
    'industrial_padrao': 1800.00,
    'shopping_center': 3650.00,
  },
  // Região Centro-Oeste
  'DF': {
    'comercial_padrao': 2550.00,
    'comercial_alto': 3300.00,
    'industrial_padrao': 1900.00,
    'shopping_center': 3900.00,
  },
  'GO': {
    'comercial_padrao': 2300.00,
    'comercial_alto': 3000.00,
    'industrial_padrao': 1700.00,
    'shopping_center': 3500.00,
  },
  'MT': {
    'comercial_padrao': 2350.00,
    'comercial_alto': 3050.00,
    'industrial_padrao': 1750.00,
    'shopping_center': 3550.00,
  },
  'MS': {
    'comercial_padrao': 2320.00,
    'comercial_alto': 3020.00,
    'industrial_padrao': 1720.00,
    'shopping_center': 3520.00,
  },
  // Região Nordeste
  'BA': {
    'comercial_padrao': 2200.00,
    'comercial_alto': 2850.00,
    'industrial_padrao': 1650.00,
    'shopping_center': 3350.00,
  },
  'PE': {
    'comercial_padrao': 2150.00,
    'comercial_alto': 2800.00,
    'industrial_padrao': 1600.00,
    'shopping_center': 3300.00,
  },
  'CE': {
    'comercial_padrao': 2100.00,
    'comercial_alto': 2750.00,
    'industrial_padrao': 1550.00,
    'shopping_center': 3250.00,
  },
  // Região Norte
  'AM': {
    'comercial_padrao': 2500.00,
    'comercial_alto': 3250.00,
    'industrial_padrao': 1850.00,
    'shopping_center': 3850.00,
  },
  'PA': {
    'comercial_padrao': 2250.00,
    'comercial_alto': 2900.00,
    'industrial_padrao': 1680.00,
    'shopping_center': 3400.00,
  },
};

type BuildingType = 'comercial_padrao' | 'comercial_alto' | 'industrial_padrao' | 'shopping_center';
type State = keyof typeof CUB_TABLE;

export interface CostCalculationInput {
  state: string; // UF do estado
  buildingType: BuildingType;
  totalArea: number; // Área total construída em m²
  floors: number; // Número de pavimentos
  qualityFactor?: number; // Fator de qualidade (0.8 a 1.2, padrão 1.0)
  complexityFactor?: number; // Fator de complexidade (0.9 a 1.3, padrão 1.0)
}

export interface CostBreakdown {
  // Custos diretos
  cubValue: number; // Valor do CUB em R$/m²
  baseCost: number; // Custo base (CUB × área)
  
  // Fatores de ajuste
  qualityAdjustment: number; // Ajuste por qualidade
  complexityAdjustment: number; // Ajuste por complexidade
  floorsAdjustment: number; // Ajuste por número de pavimentos
  
  // Custos indiretos
  projectCost: number; // Projeto arquitetônico e complementares (5-8%)
  approvalCost: number; // Aprovações e licenças (2-3%)
  managementCost: number; // Gerenciamento de obra (3-5%)
  contingency: number; // Contingência (5-10%)
  
  // Totais
  directCost: number; // Custo direto total
  indirectCost: number; // Custo indireto total
  totalCost: number; // Custo total estimado
  costPerSqm: number; // Custo por m²
}

export function calculateConstructionCost(input: CostCalculationInput): CostBreakdown {
  const {
    state,
    buildingType,
    totalArea,
    floors,
    qualityFactor = 1.0,
    complexityFactor = 1.0,
  } = input;

  // Validar estado
  const stateUpper = state.toUpperCase() as State;
  if (!CUB_TABLE[stateUpper]) {
    throw new Error(`Estado ${state} não encontrado na tabela CUB`);
  }

  // Obter valor do CUB
  const cubValue = CUB_TABLE[stateUpper][buildingType];
  if (!cubValue) {
    throw new Error(`Tipo de construção ${buildingType} não encontrado`);
  }

  // Custo base
  const baseCost = cubValue * totalArea;

  // Ajustes
  const qualityAdjustment = baseCost * (qualityFactor - 1.0);
  const complexityAdjustment = baseCost * (complexityFactor - 1.0);
  
  // Ajuste por número de pavimentos (mais pavimentos = mais custo)
  const floorsFactor = floors > 1 ? 1 + ((floors - 1) * 0.05) : 1.0; // +5% por pavimento adicional
  const floorsAdjustment = baseCost * (floorsFactor - 1.0);

  // Custo direto total
  const directCost = baseCost + qualityAdjustment + complexityAdjustment + floorsAdjustment;

  // Custos indiretos (percentuais sobre custo direto)
  const projectCost = directCost * 0.06; // 6%
  const approvalCost = directCost * 0.025; // 2.5%
  const managementCost = directCost * 0.04; // 4%
  const contingency = directCost * 0.08; // 8%

  const indirectCost = projectCost + approvalCost + managementCost + contingency;
  const totalCost = directCost + indirectCost;
  const costPerSqm = totalCost / totalArea;

  return {
    cubValue,
    baseCost,
    qualityAdjustment,
    complexityAdjustment,
    floorsAdjustment,
    projectCost,
    approvalCost,
    managementCost,
    contingency,
    directCost,
    indirectCost,
    totalCost,
    costPerSqm,
  };
}

/**
 * Obter lista de estados disponíveis
 */
export function getAvailableStates(): string[] {
  return Object.keys(CUB_TABLE);
}

/**
 * Obter tipos de construção disponíveis
 */
export function getBuildingTypes(): BuildingType[] {
  return ['comercial_padrao', 'comercial_alto', 'industrial_padrao', 'shopping_center'];
}

/**
 * Obter descrição do tipo de construção
 */
export function getBuildingTypeDescription(type: BuildingType): string {
  const descriptions = {
    'comercial_padrao': 'Comercial Padrão',
    'comercial_alto': 'Comercial Alto Padrão',
    'industrial_padrao': 'Industrial Padrão',
    'shopping_center': 'Shopping Center',
  };
  return descriptions[type];
}

/**
 * Calcular custo comparativo entre diferentes opções
 */
export function compareCosts(options: CostCalculationInput[]): CostBreakdown[] {
  return options.map(option => calculateConstructionCost(option));
}
