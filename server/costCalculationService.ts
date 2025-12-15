/**
 * Serviço de cálculo de custos de construção
 * Baseado em valores de referência CUB/SINAPI
 */

/**
 * Dados de referência de CUB por estado (valores em R$/m² para 2025)
 * Fonte: Estimativas baseadas em CUB médio Brasil e variações regionais
 */
export const cubReferenceData: Record<string, {
  state: string;
  stateName: string;
  stripMall: {
    low: number;
    medium: number;
    high: number;
    luxury: number;
  };
}> = {
  "SP": {
    state: "SP",
    stateName: "São Paulo",
    stripMall: {
      low: 1800,      // Padrão baixo
      medium: 2400,   // Padrão médio
      high: 3200,     // Padrão alto
      luxury: 4500,   // Padrão luxo
    },
  },
  "RJ": {
    state: "RJ",
    stateName: "Rio de Janeiro",
    stripMall: {
      low: 1900,
      medium: 2500,
      high: 3300,
      luxury: 4600,
    },
  },
  "MG": {
    state: "MG",
    stateName: "Minas Gerais",
    stripMall: {
      low: 1600,
      medium: 2100,
      high: 2800,
      luxury: 4000,
    },
  },
  "DF": {
    state: "DF",
    stateName: "Distrito Federal",
    stripMall: {
      low: 1850,
      medium: 2450,
      high: 3250,
      luxury: 4550,
    },
  },
  "PR": {
    state: "PR",
    stateName: "Paraná",
    stripMall: {
      low: 1700,
      medium: 2250,
      high: 3000,
      luxury: 4200,
    },
  },
  "RS": {
    state: "RS",
    stateName: "Rio Grande do Sul",
    stripMall: {
      low: 1750,
      medium: 2300,
      high: 3050,
      luxury: 4300,
    },
  },
  "SC": {
    state: "SC",
    stateName: "Santa Catarina",
    stripMall: {
      low: 1700,
      medium: 2250,
      high: 3000,
      luxury: 4200,
    },
  },
  "BA": {
    state: "BA",
    stateName: "Bahia",
    stripMall: {
      low: 1500,
      medium: 2000,
      high: 2650,
      luxury: 3750,
    },
  },
  "PE": {
    state: "PE",
    stateName: "Pernambuco",
    stripMall: {
      low: 1550,
      medium: 2050,
      high: 2700,
      luxury: 3800,
    },
  },
  "CE": {
    state: "CE",
    stateName: "Ceará",
    stripMall: {
      low: 1500,
      medium: 2000,
      high: 2650,
      luxury: 3750,
    },
  },
  "GO": {
    state: "GO",
    stateName: "Goiás",
    stripMall: {
      low: 1600,
      medium: 2100,
      high: 2800,
      luxury: 4000,
    },
  },
  "ES": {
    state: "ES",
    stateName: "Espírito Santo",
    stripMall: {
      low: 1700,
      medium: 2250,
      high: 3000,
      luxury: 4200,
    },
  },
};

/**
 * Distribuição percentual de custos por categoria
 * Baseado em composições típicas de strip malls
 */
export const costBreakdown = {
  structure: 0.35,        // 35% - Estrutura (fundação, pilares, lajes, cobertura)
  finishing: 0.25,        // 25% - Acabamento (revestimentos, pintura, esquadrias, portas)
  installations: 0.20,    // 20% - Instalações (elétrica, hidráulica, climatização, prevenção)
  parking: 0.10,          // 10% - Estacionamento (pavimentação, drenagem, sinalização)
  commonAreas: 0.10,      // 10% - Áreas comuns (paisagismo, mobiliário, iluminação externa)
};

/**
 * Custos adicionais como percentual do custo direto
 */
export const additionalCosts = {
  project: 0.05,          // 5% - Projetos (arquitetônico, estrutural, instalações)
  management: 0.08,       // 8% - Gerenciamento de obra
  contingency: 0.10,      // 10% - Contingência
};

/**
 * Calcula custo total de construção baseado em área e padrão
 */
export function calculateConstructionCost(params: {
  totalArea: number;
  state: string;
  standard: "low" | "medium" | "high" | "luxury";
  commercialArea?: number;
  parkingArea?: number;
  commonArea?: number;
}): {
  totalCost: number;
  costPerSqm: number;
  breakdown: {
    structure: number;
    finishing: number;
    installations: number;
    parking: number;
    commonAreas: number;
    project: number;
    management: number;
    contingency: number;
  };
  directCost: number;
  indirectCost: number;
} {
  // Buscar custo base por m² para o estado
  const stateData = cubReferenceData[params.state];
  let baseCostPerSqm: number;
  
  if (stateData) {
    baseCostPerSqm = stateData.stripMall[params.standard];
  } else {
    // Se estado não encontrado, usar média nacional
    const avgCost = {
      low: 1650,
      medium: 2200,
      high: 2900,
      luxury: 4100,
    };
    baseCostPerSqm = avgCost[params.standard];
  }
  
  // Custo direto (construção)
  const directCost = params.totalArea * baseCostPerSqm;
  
  // Breakdown por categoria
  const structure = directCost * costBreakdown.structure;
  const finishing = directCost * costBreakdown.finishing;
  const installations = directCost * costBreakdown.installations;
  const parking = directCost * costBreakdown.parking;
  const commonAreas = directCost * costBreakdown.commonAreas;
  
  // Custos indiretos
  const project = directCost * additionalCosts.project;
  const management = directCost * additionalCosts.management;
  const contingency = directCost * additionalCosts.contingency;
  
  const indirectCost = project + management + contingency;
  const totalCost = directCost + indirectCost;
  const costPerSqm = totalCost / params.totalArea;
  
  return {
    totalCost: Math.round(totalCost),
    costPerSqm: Math.round(costPerSqm),
    breakdown: {
      structure: Math.round(structure),
      finishing: Math.round(finishing),
      installations: Math.round(installations),
      parking: Math.round(parking),
      commonAreas: Math.round(commonAreas),
      project: Math.round(project),
      management: Math.round(management),
      contingency: Math.round(contingency),
    },
    directCost: Math.round(directCost),
    indirectCost: Math.round(indirectCost),
  };
}

/**
 * Calcula análise de viabilidade financeira
 */
export function calculateFinancialViability(params: {
  totalCost: number;
  commercialArea: number;
  averageRentPerSqm: number; // Aluguel médio por m² por mês
  occupancyRate: number; // Taxa de ocupação (0-100)
  operatingCosts: number; // Custos operacionais mensais
}): {
  monthlyRevenue: number;
  monthlyProfit: number;
  annualRevenue: number;
  annualProfit: number;
  roi: number; // ROI anual em %
  paybackMonths: number;
  profitMargin: number; // Margem de lucro em %
} {
  // Receita mensal bruta
  const monthlyRevenue = params.commercialArea * params.averageRentPerSqm * (params.occupancyRate / 100);
  
  // Lucro mensal (receita - custos operacionais)
  const monthlyProfit = monthlyRevenue - params.operatingCosts;
  
  // Valores anuais
  const annualRevenue = monthlyRevenue * 12;
  const annualProfit = monthlyProfit * 12;
  
  // ROI anual
  const roi = (annualProfit / params.totalCost) * 100;
  
  // Payback em meses
  const paybackMonths = params.totalCost / monthlyProfit;
  
  // Margem de lucro
  const profitMargin = (monthlyProfit / monthlyRevenue) * 100;
  
  return {
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyProfit: Math.round(monthlyProfit),
    annualRevenue: Math.round(annualRevenue),
    annualProfit: Math.round(annualProfit),
    roi: Math.round(roi * 100) / 100,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    profitMargin: Math.round(profitMargin * 100) / 100,
  };
}

/**
 * Retorna lista de estados com dados de CUB
 */
export function getAvailableStates() {
  return Object.values(cubReferenceData).map(data => ({
    state: data.state,
    stateName: data.stateName,
    costs: data.stripMall,
  }));
}
