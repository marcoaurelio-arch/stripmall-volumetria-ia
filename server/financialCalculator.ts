/**
 * Calculadora de Viabilidade Financeira para Strip Malls
 * 
 * Implementa cálculos de:
 * - VPL (Valor Presente Líquido)
 * - TIR (Taxa Interna de Retorno)
 * - Payback (Período de Retorno)
 * - Projeção de Receitas e Custos
 * - Fluxo de Caixa
 */

interface FinancialInputs {
  // Investimento Inicial
  landCost: number; // Custo do terreno
  constructionCostPerSqm: number; // Custo de construção por m²
  buildableArea: number; // Área construída total
  
  // Características do Empreendimento
  numberOfStores: number; // Número de lojas
  parkingSpaces: number; // Vagas de estacionamento
  
  // Parâmetros de Receita
  averageRentPerSqm: number; // Aluguel médio por m² (R$/m²/mês)
  vacancyRate: number; // Taxa de vacância (0-1)
  annualRentIncrease: number; // Reajuste anual de aluguel (0-1)
  
  // Parâmetros de Custo
  operationalCostRate: number; // Custos operacionais (% da receita)
  propertyTaxRate: number; // IPTU (% do valor do imóvel)
  maintenanceRate: number; // Manutenção (% da receita)
  
  // Parâmetros Financeiros
  discountRate: number; // Taxa de desconto para VPL (0-1)
  projectionYears: number; // Anos de projeção
}

interface CashFlowYear {
  year: number;
  grossRevenue: number; // Receita bruta
  operationalCosts: number; // Custos operacionais
  propertyTax: number; // IPTU
  maintenance: number; // Manutenção
  netRevenue: number; // Receita líquida
  cumulativeCashFlow: number; // Fluxo de caixa acumulado
}

interface FinancialAnalysis {
  // Investimento
  totalInvestment: number;
  landCost: number;
  constructionCost: number;
  
  // Receitas Anuais
  annualGrossRevenue: number;
  annualNetRevenue: number;
  
  // Indicadores de Viabilidade
  npv: number; // VPL
  irr: number; // TIR
  paybackYears: number; // Payback em anos
  
  // Rentabilidade
  annualYield: number; // Rentabilidade anual (%)
  capRate: number; // Cap Rate (%)
  
  // Fluxo de Caixa
  cashFlow: CashFlowYear[];
  
  // Análise de Sensibilidade
  scenarios: {
    optimistic: { npv: number; irr: number; paybackYears: number };
    base: { npv: number; irr: number; paybackYears: number };
    pessimistic: { npv: number; irr: number; paybackYears: number };
  };
}

/**
 * Calcula o VPL (Valor Presente Líquido)
 */
function calculateNPV(cashFlows: number[], discountRate: number, initialInvestment: number): number {
  let npv = -initialInvestment;
  
  for (let year = 0; year < cashFlows.length; year++) {
    npv += cashFlows[year] / Math.pow(1 + discountRate, year + 1);
  }
  
  return npv;
}

/**
 * Calcula a TIR (Taxa Interna de Retorno) usando método de Newton-Raphson
 */
function calculateIRR(cashFlows: number[], initialInvestment: number): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let irr = 0.1; // Chute inicial de 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;
    let derivative = 0;
    
    for (let year = 0; year < cashFlows.length; year++) {
      const t = year + 1;
      npv += cashFlows[year] / Math.pow(1 + irr, t);
      derivative -= (t * cashFlows[year]) / Math.pow(1 + irr, t + 1);
    }
    
    const newIrr = irr - npv / derivative;
    
    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr;
    }
    
    irr = newIrr;
  }
  
  return irr;
}

/**
 * Calcula o período de payback (retorno do investimento)
 */
function calculatePayback(cashFlows: number[], initialInvestment: number): number {
  let cumulativeCashFlow = -initialInvestment;
  
  for (let year = 0; year < cashFlows.length; year++) {
    cumulativeCashFlow += cashFlows[year];
    
    if (cumulativeCashFlow >= 0) {
      // Interpolação para encontrar o ano exato
      const previousCumulativeCashFlow = cumulativeCashFlow - cashFlows[year];
      const fraction = Math.abs(previousCumulativeCashFlow) / cashFlows[year];
      return year + fraction;
    }
  }
  
  return cashFlows.length; // Não recuperou o investimento no período
}

/**
 * Calcula a análise financeira completa
 */
export function calculateFinancialAnalysis(inputs: FinancialInputs): FinancialAnalysis {
  // Investimento Inicial
  const landCost = inputs.landCost;
  const constructionCost = inputs.buildableArea * inputs.constructionCostPerSqm;
  const totalInvestment = landCost + constructionCost;
  
  // Receita Bruta Anual (considerando área privativa de 78%)
  const rentableArea = inputs.buildableArea * 0.78; // Área privativa
  const monthlyGrossRevenue = rentableArea * inputs.averageRentPerSqm * (1 - inputs.vacancyRate);
  const annualGrossRevenue = monthlyGrossRevenue * 12;
  
  // Custos Anuais
  const operationalCosts = annualGrossRevenue * inputs.operationalCostRate;
  const propertyTax = totalInvestment * inputs.propertyTaxRate;
  const maintenance = annualGrossRevenue * inputs.maintenanceRate;
  const totalAnnualCosts = operationalCosts + propertyTax + maintenance;
  
  // Receita Líquida Anual
  const annualNetRevenue = annualGrossRevenue - totalAnnualCosts;
  
  // Fluxo de Caixa Projetado
  const cashFlow: CashFlowYear[] = [];
  const netCashFlows: number[] = [];
  let cumulativeCashFlow = -totalInvestment;
  
  for (let year = 1; year <= inputs.projectionYears; year++) {
    // Receita cresce com reajuste anual
    const yearGrossRevenue = annualGrossRevenue * Math.pow(1 + inputs.annualRentIncrease, year - 1);
    const yearOperationalCosts = yearGrossRevenue * inputs.operationalCostRate;
    const yearPropertyTax = totalInvestment * inputs.propertyTaxRate;
    const yearMaintenance = yearGrossRevenue * inputs.maintenanceRate;
    const yearNetRevenue = yearGrossRevenue - yearOperationalCosts - yearPropertyTax - yearMaintenance;
    
    cumulativeCashFlow += yearNetRevenue;
    netCashFlows.push(yearNetRevenue);
    
    cashFlow.push({
      year,
      grossRevenue: yearGrossRevenue,
      operationalCosts: yearOperationalCosts,
      propertyTax: yearPropertyTax,
      maintenance: yearMaintenance,
      netRevenue: yearNetRevenue,
      cumulativeCashFlow,
    });
  }
  
  // Cálculo de Indicadores
  const npv = calculateNPV(netCashFlows, inputs.discountRate, totalInvestment);
  const irr = calculateIRR(netCashFlows, totalInvestment);
  const paybackYears = calculatePayback(netCashFlows, totalInvestment);
  
  // Rentabilidade
  const annualYield = (annualNetRevenue / totalInvestment) * 100;
  const capRate = (annualNetRevenue / totalInvestment) * 100;
  
  // Análise de Sensibilidade (variação de ±20% na receita)
  const optimisticInputs = { ...inputs, averageRentPerSqm: inputs.averageRentPerSqm * 1.2 };
  const pessimisticInputs = { ...inputs, averageRentPerSqm: inputs.averageRentPerSqm * 0.8 };
  
  const optimisticCashFlows = generateCashFlows(optimisticInputs, totalInvestment);
  const pessimisticCashFlows = generateCashFlows(pessimisticInputs, totalInvestment);
  
  return {
    totalInvestment,
    landCost,
    constructionCost,
    annualGrossRevenue,
    annualNetRevenue,
    npv,
    irr,
    paybackYears,
    annualYield,
    capRate,
    cashFlow,
    scenarios: {
      optimistic: {
        npv: calculateNPV(optimisticCashFlows, inputs.discountRate, totalInvestment),
        irr: calculateIRR(optimisticCashFlows, totalInvestment),
        paybackYears: calculatePayback(optimisticCashFlows, totalInvestment),
      },
      base: { npv, irr, paybackYears },
      pessimistic: {
        npv: calculateNPV(pessimisticCashFlows, inputs.discountRate, totalInvestment),
        irr: calculateIRR(pessimisticCashFlows, totalInvestment),
        paybackYears: calculatePayback(pessimisticCashFlows, totalInvestment),
      },
    },
  };
}

/**
 * Gera fluxo de caixa para análise de sensibilidade
 */
function generateCashFlows(inputs: FinancialInputs, totalInvestment: number): number[] {
  const cashFlows: number[] = [];
  const rentableArea = inputs.buildableArea * 0.78;
  const monthlyGrossRevenue = rentableArea * inputs.averageRentPerSqm * (1 - inputs.vacancyRate);
  const annualGrossRevenue = monthlyGrossRevenue * 12;
  
  for (let year = 1; year <= inputs.projectionYears; year++) {
    const yearGrossRevenue = annualGrossRevenue * Math.pow(1 + inputs.annualRentIncrease, year - 1);
    const yearOperationalCosts = yearGrossRevenue * inputs.operationalCostRate;
    const yearPropertyTax = totalInvestment * inputs.propertyTaxRate;
    const yearMaintenance = yearGrossRevenue * inputs.maintenanceRate;
    const yearNetRevenue = yearGrossRevenue - yearOperationalCosts - yearPropertyTax - yearMaintenance;
    
    cashFlows.push(yearNetRevenue);
  }
  
  return cashFlows;
}

/**
 * Parâmetros padrão para strip malls no Brasil
 */
export const DEFAULT_FINANCIAL_PARAMS = {
  averageRentPerSqm: 80, // R$ 80/m²/mês (média para strip malls)
  vacancyRate: 0.10, // 10% de vacância
  annualRentIncrease: 0.05, // 5% ao ano (IPCA + spread)
  operationalCostRate: 0.15, // 15% da receita
  propertyTaxRate: 0.01, // 1% ao ano do valor do imóvel
  maintenanceRate: 0.08, // 8% da receita
  discountRate: 0.10, // 10% ao ano (taxa de desconto)
  projectionYears: 10, // 10 anos de projeção
  constructionCostPerSqm: 3500, // R$ 3.500/m² (custo médio de construção)
};

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata percentual
 */
export function formatPercent(value: number): string {
  return (value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
}

/**
 * Formata anos
 */
export function formatYears(value: number): string {
  const years = Math.floor(value);
  const months = Math.round((value - years) * 12);
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}
