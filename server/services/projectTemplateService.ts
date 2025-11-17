/**
 * Serviço de templates e sugestão automática de parâmetros
 * Calcula parâmetros urbanísticos baseados na área do terreno
 */

export interface ScenarioSuggestion {
  name: string;
  description: string;
  taxaOcupacao: number;
  coeficienteAproveitamento: number;
  numeroLojas: number;
  vagasEstacionamento: number;
  recuoFrontal: number;
  recuoLateral: number;
  recuoFundos: number;
  alturaMaxima: number;
  areaOcupada: number;
  areaConstruida: number;
  areaMediaPorLoja: number;
}

export interface TemplateSuggestion {
  templateName: string;
  faixaArea: string;
  conservador: ScenarioSuggestion;
  balanceado: ScenarioSuggestion;
  otimista: ScenarioSuggestion;
}

/**
 * Determina a faixa de área e retorna configurações base
 */
function getAreaRange(area: number) {
  if (area < 3000) {
    return {
      name: 'Pequeno Porte',
      faixa: '1.000 - 3.000 m²',
      taxaOcupacaoMin: 60,
      taxaOcupacaoMax: 70,
      coeficienteMin: 0.8,
      coeficienteMax: 1.2,
      m2PorVagaMin: 28,
      m2PorVagaMax: 30,
      areaMediaPorLojaMin: 250,
      areaMediaPorLojaMax: 350,
      recuoFrontal: 5,
      recuoLateral: 3,
      recuoFundos: 3,
      alturaMaxima: 6,
    };
  } else if (area < 6000) {
    return {
      name: 'Médio Porte',
      faixa: '3.000 - 6.000 m²',
      taxaOcupacaoMin: 65,
      taxaOcupacaoMax: 75,
      coeficienteMin: 1.0,
      coeficienteMax: 1.5,
      m2PorVagaMin: 27,
      m2PorVagaMax: 29,
      areaMediaPorLojaMin: 350,
      areaMediaPorLojaMax: 550,
      recuoFrontal: 5,
      recuoLateral: 4,
      recuoFundos: 4,
      alturaMaxima: 9,
    };
  } else if (area < 10000) {
    return {
      name: 'Grande Porte',
      faixa: '6.000 - 10.000 m²',
      taxaOcupacaoMin: 70,
      taxaOcupacaoMax: 80,
      coeficienteMin: 1.2,
      coeficienteMax: 1.8,
      m2PorVagaMin: 26,
      m2PorVagaMax: 28,
      areaMediaPorLojaMin: 450,
      areaMediaPorLojaMax: 650,
      recuoFrontal: 6,
      recuoLateral: 5,
      recuoFundos: 5,
      alturaMaxima: 10,
    };
  } else {
    return {
      name: 'Extra Grande Porte',
      faixa: '10.000 - 15.000 m²',
      taxaOcupacaoMin: 75,
      taxaOcupacaoMax: 85,
      coeficienteMin: 1.5,
      coeficienteMax: 2.0,
      m2PorVagaMin: 25,
      m2PorVagaMax: 27,
      areaMediaPorLojaMin: 550,
      areaMediaPorLojaMax: 700,
      recuoFrontal: 8,
      recuoLateral: 6,
      recuoFundos: 6,
      alturaMaxima: 12,
    };
  }
}

/**
 * Calcula cenário conservador (parâmetros mínimos)
 */
function calculateConservative(area: number, range: ReturnType<typeof getAreaRange>): ScenarioSuggestion {
  const taxaOcupacao = range.taxaOcupacaoMin;
  const coeficiente = range.coeficienteMin;
  const m2PorVaga = range.m2PorVagaMax; // Mais vagas = mais conservador
  const areaMediaPorLoja = range.areaMediaPorLojaMax; // Lojas maiores = menos lojas
  
  const areaOcupada = Math.round(area * (taxaOcupacao / 100));
  const areaConstruida = Math.round(area * coeficiente);
  const numeroLojas = Math.round(areaConstruida / areaMediaPorLoja);
  const vagasEstacionamento = Math.ceil(areaConstruida * 0.75 / m2PorVaga); // 75% da área = ABL
  
  return {
    name: 'Conservador',
    description: 'Maximiza conforto e facilidade de aprovação',
    taxaOcupacao,
    coeficienteAproveitamento: coeficiente,
    numeroLojas,
    vagasEstacionamento,
    recuoFrontal: range.recuoFrontal,
    recuoLateral: range.recuoLateral,
    recuoFundos: range.recuoFundos,
    alturaMaxima: range.alturaMaxima,
    areaOcupada,
    areaConstruida,
    areaMediaPorLoja: Math.round(areaConstruida / numeroLojas),
  };
}

/**
 * Calcula cenário balanceado (parâmetros médios)
 */
function calculateBalanced(area: number, range: ReturnType<typeof getAreaRange>): ScenarioSuggestion {
  const taxaOcupacao = Math.round((range.taxaOcupacaoMin + range.taxaOcupacaoMax) / 2);
  const coeficiente = (range.coeficienteMin + range.coeficienteMax) / 2;
  const m2PorVaga = Math.round((range.m2PorVagaMin + range.m2PorVagaMax) / 2);
  const areaMediaPorLoja = Math.round((range.areaMediaPorLojaMin + range.areaMediaPorLojaMax) / 2);
  
  const areaOcupada = Math.round(area * (taxaOcupacao / 100));
  const areaConstruida = Math.round(area * coeficiente);
  const numeroLojas = Math.round(areaConstruida / areaMediaPorLoja);
  const vagasEstacionamento = Math.ceil(areaConstruida * 0.75 / m2PorVaga);
  
  return {
    name: 'Balanceado',
    description: 'Equilíbrio entre rentabilidade e conforto (Recomendado)',
    taxaOcupacao,
    coeficienteAproveitamento: coeficiente,
    numeroLojas,
    vagasEstacionamento,
    recuoFrontal: range.recuoFrontal,
    recuoLateral: range.recuoLateral,
    recuoFundos: range.recuoFundos,
    alturaMaxima: range.alturaMaxima,
    areaOcupada,
    areaConstruida,
    areaMediaPorLoja: Math.round(areaConstruida / numeroLojas),
  };
}

/**
 * Calcula cenário otimista (parâmetros máximos)
 */
function calculateOptimistic(area: number, range: ReturnType<typeof getAreaRange>): ScenarioSuggestion {
  const taxaOcupacao = range.taxaOcupacaoMax;
  const coeficiente = range.coeficienteMax;
  const m2PorVaga = range.m2PorVagaMin; // Menos vagas = mais otimista
  const areaMediaPorLoja = range.areaMediaPorLojaMin; // Lojas menores = mais lojas
  
  const areaOcupada = Math.round(area * (taxaOcupacao / 100));
  const areaConstruida = Math.round(area * coeficiente);
  const numeroLojas = Math.round(areaConstruida / areaMediaPorLoja);
  const vagasEstacionamento = Math.ceil(areaConstruida * 0.75 / m2PorVaga);
  
  return {
    name: 'Otimista',
    description: 'Maximiza rentabilidade e área bruta locável',
    taxaOcupacao,
    coeficienteAproveitamento: coeficiente,
    numeroLojas,
    vagasEstacionamento,
    recuoFrontal: range.recuoFrontal,
    recuoLateral: range.recuoLateral,
    recuoFundos: range.recuoFundos,
    alturaMaxima: range.alturaMaxima,
    areaOcupada,
    areaConstruida,
    areaMediaPorLoja: Math.round(areaConstruida / numeroLojas),
  };
}

/**
 * Gera sugestões de cenários baseados na área do terreno
 */
export function generateScenarioSuggestions(areaTerreno: number): TemplateSuggestion {
  const range = getAreaRange(areaTerreno);
  
  return {
    templateName: range.name,
    faixaArea: range.faixa,
    conservador: calculateConservative(areaTerreno, range),
    balanceado: calculateBalanced(areaTerreno, range),
    otimista: calculateOptimistic(areaTerreno, range),
  };
}
