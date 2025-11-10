/**
 * Calculadora de Áreas conforme ABNT NBR 12.721
 * 
 * A NBR 12.721 estabelece critérios para avaliação de custos unitários e
 * preparo de orçamento de construção para incorporação de edifício em condomínio.
 * 
 * Áreas principais:
 * - Área Real Privativa: área útil de cada unidade autônoma
 * - Área Comum: áreas de uso comum (circulação, escadas, elevadores, etc)
 * - Área Total: soma das áreas privativas e comuns
 * - Área Equivalente de Construção: área ponderada para cálculo de custos
 */

interface ProjectData {
  totalLandArea: number; // Área do terreno em m²
  buildableArea: number; // Área construída total em m²
  numberOfStores: number; // Número de lojas
  parkingSpaces: number; // Número de vagas de estacionamento
  numberOfFloors?: number; // Número de pavimentos (padrão: 1)
}

interface AreaBreakdown {
  // Áreas Principais
  areaTerreno: number; // Área do terreno
  areaTotalConstruida: number; // Área total construída
  
  // Áreas Privativas
  areaPrivativaTotal: number; // Área privativa total (lojas)
  areaPrivativaPorLoja: number; // Área média por loja
  
  // Áreas Comuns
  areaComumTotal: number; // Área comum total
  areaCirculacao: number; // Circulação e corredores
  areaSanitarios: number; // Banheiros e vestiários
  areaAdministrativa: number; // Administração e depósitos
  
  // Área de Estacionamento
  areaEstacionamento: number; // Área total de estacionamento
  areaPorVaga: number; // Área média por vaga
  
  // Índices Urbanísticos
  taxaOcupacao: number; // Taxa de ocupação (%)
  coeficienteAproveitamento: number; // Coeficiente de aproveitamento
  numeroPavimentos: number; // Número de pavimentos
  
  // Áreas Descobertas
  areaLivre: number; // Área livre do terreno
  areaPermeavel: number; // Área permeável (estimada)
  
  // Proporções
  percentualPrivativo: number; // % área privativa sobre total
  percentualComum: number; // % área comum sobre total
  percentualEstacionamento: number; // % estacionamento sobre terreno
}

/**
 * Calcula o quadro de áreas completo conforme ABNT NBR 12.721
 */
export function calculateAreaBreakdown(project: ProjectData): AreaBreakdown {
  const numberOfFloors = project.numberOfFloors || 1;
  
  // Área construída total
  const areaTotalConstruida = project.buildableArea;
  
  // Estimativa de áreas comuns (tipicamente 20-25% em strip malls)
  const percentualComum = 0.22; // 22% para áreas comuns
  const areaComumTotal = areaTotalConstruida * percentualComum;
  
  // Área privativa (lojas)
  const areaPrivativaTotal = areaTotalConstruida - areaComumTotal;
  const areaPrivativaPorLoja = project.numberOfStores > 0 
    ? areaPrivativaTotal / project.numberOfStores 
    : 0;
  
  // Distribuição das áreas comuns
  const areaCirculacao = areaComumTotal * 0.60; // 60% circulação
  const areaSanitarios = areaComumTotal * 0.25; // 25% sanitários
  const areaAdministrativa = areaComumTotal * 0.15; // 15% administrativa
  
  // Área de estacionamento (padrão: 25m² por vaga incluindo circulação)
  const areaPorVaga = 25;
  const areaEstacionamento = project.parkingSpaces * areaPorVaga;
  
  // Taxa de ocupação (área construída no térreo / área do terreno)
  // Para strip malls, geralmente há apenas térreo ou térreo + mezanino
  const areaOcupadaTerreo = areaTotalConstruida / numberOfFloors;
  const taxaOcupacao = (areaOcupadaTerreo / project.totalLandArea) * 100;
  
  // Coeficiente de aproveitamento (área total construída / área do terreno)
  const coeficienteAproveitamento = areaTotalConstruida / project.totalLandArea;
  
  // Área livre do terreno
  const areaLivre = project.totalLandArea - areaOcupadaTerreo - areaEstacionamento;
  
  // Área permeável (estimativa: 15% do terreno para strip malls)
  const areaPermeavel = project.totalLandArea * 0.15;
  
  // Proporções
  const percentualPrivativo = (areaPrivativaTotal / areaTotalConstruida) * 100;
  const percentualComumCalc = (areaComumTotal / areaTotalConstruida) * 100;
  const percentualEstacionamento = (areaEstacionamento / project.totalLandArea) * 100;
  
  return {
    // Áreas Principais
    areaTerreno: project.totalLandArea,
    areaTotalConstruida,
    
    // Áreas Privativas
    areaPrivativaTotal,
    areaPrivativaPorLoja,
    
    // Áreas Comuns
    areaComumTotal,
    areaCirculacao,
    areaSanitarios,
    areaAdministrativa,
    
    // Área de Estacionamento
    areaEstacionamento,
    areaPorVaga,
    
    // Índices Urbanísticos
    taxaOcupacao,
    coeficienteAproveitamento,
    numeroPavimentos: numberOfFloors,
    
    // Áreas Descobertas
    areaLivre: Math.max(0, areaLivre),
    areaPermeavel,
    
    // Proporções
    percentualPrivativo,
    percentualComum: percentualComumCalc,
    percentualEstacionamento,
  };
}

/**
 * Formata valor de área para exibição
 */
export function formatArea(area: number): string {
  return area.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " m²";
}

/**
 * Formata percentual para exibição
 */
export function formatPercentage(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
}

/**
 * Formata coeficiente para exibição
 */
export function formatCoefficient(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
