/**
 * Serviço de Análise Financeira Avançada
 * 
 * Calcula TIR, VPL, projeções de fluxo de caixa e análise de sensibilidade
 */

interface FluxoCaixaAnual {
  ano: number;
  receitaBruta: number;
  receitaLiquida: number; // Após vacância
  despesaOperacional: number;
  despesaFinanciamento: number;
  saldo: number;
  saldoAcumulado: number;
  saldoDescontado: number;
  saldoDescontadoAcumulado: number;
}

interface CenarioFinanciamento {
  tipo: 'proprio' | 'bancario' | 'misto';
  percentualFinanciado: number; // 0-100
  taxaJurosAnual: number; // % * 100
  prazoMeses: number;
  parcelaMensal: number;
}

interface AnaliseSensibilidade {
  parametro: 'aluguel' | 'vacancia' | 'custos';
  variacao: number; // -50 a +50 (%)
  vpl: number;
  tir: number;
  payback: number;
}

interface ResultadoFinanceiro {
  tir: number; // % * 100
  vpl: number;
  paybackSimples: number; // meses
  paybackDescontado: number; // meses
  fluxoCaixaAnual: FluxoCaixaAnual[];
  cenarioFinanciamento: CenarioFinanciamento;
  analiseSensibilidade: {
    aluguel: AnaliseSensibilidade[];
    vacancia: AnaliseSensibilidade[];
    custos: AnaliseSensibilidade[];
  };
}

/**
 * Calcula parcela mensal de financiamento usando Sistema Price (SAC)
 */
function calcularParcelaMensal(
  valorFinanciado: number,
  taxaJurosAnual: number,
  prazoMeses: number
): number {
  const taxaMensal = (taxaJurosAnual / 100 / 100) / 12; // Converter de % * 100 para decimal mensal
  
  if (taxaMensal === 0) {
    return valorFinanciado / prazoMeses;
  }
  
  // Fórmula do Sistema Price
  const parcela = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                  (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  
  return Math.round(parcela);
}

/**
 * Calcula TIR (Taxa Interna de Retorno) usando método de Newton-Raphson
 */
function calcularTIR(fluxos: number[]): number {
  // Método iterativo para encontrar a taxa que zera o VPL
  let tir = 0.1; // Chute inicial de 10%
  const maxIteracoes = 100;
  const precisao = 0.0001;
  
  for (let i = 0; i < maxIteracoes; i++) {
    let vpl = 0;
    let derivada = 0;
    
    for (let t = 0; t < fluxos.length; t++) {
      vpl += fluxos[t] / Math.pow(1 + tir, t);
      derivada -= t * fluxos[t] / Math.pow(1 + tir, t + 1);
    }
    
    if (Math.abs(vpl) < precisao) {
      return Math.round(tir * 100 * 100); // Converter para % * 100
    }
    
    if (derivada === 0) {
      break;
    }
    
    tir = tir - vpl / derivada;
    
    // Evitar valores negativos ou muito altos
    if (tir < -0.99) tir = -0.99;
    if (tir > 10) tir = 10;
  }
  
  return Math.round(tir * 100 * 100);
}

/**
 * Calcula VPL (Valor Presente Líquido)
 */
function calcularVPL(fluxos: number[], taxaDesconto: number): number {
  const taxa = taxaDesconto / 100 / 100; // Converter de % * 100 para decimal
  
  let vpl = 0;
  for (let t = 0; t < fluxos.length; t++) {
    vpl += fluxos[t] / Math.pow(1 + taxa, t);
  }
  
  return Math.round(vpl);
}

/**
 * Calcula período de payback simples (em meses)
 */
function calcularPaybackSimples(fluxosMensais: number[]): number {
  let acumulado = 0;
  
  for (let mes = 0; mes < fluxosMensais.length; mes++) {
    acumulado += fluxosMensais[mes];
    
    if (acumulado >= 0) {
      // Interpolar para encontrar o mês exato
      const mesAnterior = mes - 1;
      const saldoAnterior = acumulado - fluxosMensais[mes];
      const proporcao = -saldoAnterior / fluxosMensais[mes];
      
      return Math.round(mesAnterior + proporcao);
    }
  }
  
  return fluxosMensais.length; // Não recupera o investimento no período
}

/**
 * Calcula período de payback descontado (em meses)
 */
function calcularPaybackDescontado(
  fluxosMensais: number[],
  taxaDescontoAnual: number
): number {
  const taxaMensal = Math.pow(1 + taxaDescontoAnual / 100 / 100, 1/12) - 1;
  let acumulado = 0;
  
  for (let mes = 0; mes < fluxosMensais.length; mes++) {
    const fluxoDescontado = fluxosMensais[mes] / Math.pow(1 + taxaMensal, mes);
    acumulado += fluxoDescontado;
    
    if (acumulado >= 0) {
      return mes;
    }
  }
  
  return fluxosMensais.length;
}

/**
 * Gera projeções de fluxo de caixa para 10 anos
 */
function gerarProjecoes(
  investimentoInicial: number,
  receitaMensalAluguel: number,
  taxaVacancia: number,
  custoOperacionalMensal: number,
  cenarioFinanciamento: CenarioFinanciamento,
  taxaDesconto: number
): FluxoCaixaAnual[] {
  const anos = 10;
  const projecoes: FluxoCaixaAnual[] = [];
  let saldoAcumulado = -investimentoInicial;
  let saldoDescontadoAcumulado = -investimentoInicial;
  
  const receitaLiquidaMensal = receitaMensalAluguel * (1 - taxaVacancia / 100);
  const despesaFinanciamentoMensal = cenarioFinanciamento.parcelaMensal;
  
  for (let ano = 1; ano <= anos; ano++) {
    const receitaBruta = receitaMensalAluguel * 12;
    const receitaLiquida = receitaLiquidaMensal * 12;
    const despesaOperacional = custoOperacionalMensal * 12;
    const despesaFinanciamento = ano * 12 <= cenarioFinanciamento.prazoMeses 
      ? despesaFinanciamentoMensal * 12 
      : 0;
    
    const saldo = receitaLiquida - despesaOperacional - despesaFinanciamento;
    saldoAcumulado += saldo;
    
    // Calcular saldo descontado
    const taxaDescontoDecimal = taxaDesconto / 100 / 100;
    const saldoDescontado = saldo / Math.pow(1 + taxaDescontoDecimal, ano);
    saldoDescontadoAcumulado += saldoDescontado;
    
    projecoes.push({
      ano,
      receitaBruta: Math.round(receitaBruta),
      receitaLiquida: Math.round(receitaLiquida),
      despesaOperacional: Math.round(despesaOperacional),
      despesaFinanciamento: Math.round(despesaFinanciamento),
      saldo: Math.round(saldo),
      saldoAcumulado: Math.round(saldoAcumulado),
      saldoDescontado: Math.round(saldoDescontado),
      saldoDescontadoAcumulado: Math.round(saldoDescontadoAcumulado),
    });
  }
  
  return projecoes;
}

/**
 * Realiza análise de sensibilidade variando parâmetros
 */
function analisarSensibilidade(
  investimentoInicial: number,
  receitaMensalAluguel: number,
  taxaVacancia: number,
  custoOperacionalMensal: number,
  cenarioFinanciamento: CenarioFinanciamento,
  taxaDesconto: number
): ResultadoFinanceiro['analiseSensibilidade'] {
  const variacoes = [-30, -20, -10, 0, 10, 20, 30]; // Variações em %
  
  // Análise de sensibilidade do aluguel
  const sensibilidadeAluguel: AnaliseSensibilidade[] = variacoes.map(variacao => {
    const receitaAjustada = receitaMensalAluguel * (1 + variacao / 100);
    const resultado = calcularIndicadores(
      investimentoInicial,
      receitaAjustada,
      taxaVacancia,
      custoOperacionalMensal,
      cenarioFinanciamento,
      taxaDesconto
    );
    
    return {
      parametro: 'aluguel',
      variacao,
      vpl: resultado.vpl,
      tir: resultado.tir,
      payback: resultado.paybackSimples,
    };
  });
  
  // Análise de sensibilidade da vacância
  const sensibilidadeVacancia: AnaliseSensibilidade[] = variacoes.map(variacao => {
    const vacanciaAjustada = Math.max(0, Math.min(100, taxaVacancia + variacao));
    const resultado = calcularIndicadores(
      investimentoInicial,
      receitaMensalAluguel,
      vacanciaAjustada,
      custoOperacionalMensal,
      cenarioFinanciamento,
      taxaDesconto
    );
    
    return {
      parametro: 'vacancia',
      variacao,
      vpl: resultado.vpl,
      tir: resultado.tir,
      payback: resultado.paybackSimples,
    };
  });
  
  // Análise de sensibilidade dos custos
  const sensibilidadeCustos: AnaliseSensibilidade[] = variacoes.map(variacao => {
    const custoAjustado = custoOperacionalMensal * (1 + variacao / 100);
    const resultado = calcularIndicadores(
      investimentoInicial,
      receitaMensalAluguel,
      taxaVacancia,
      custoAjustado,
      cenarioFinanciamento,
      taxaDesconto
    );
    
    return {
      parametro: 'custos',
      variacao,
      vpl: resultado.vpl,
      tir: resultado.tir,
      payback: resultado.paybackSimples,
    };
  });
  
  return {
    aluguel: sensibilidadeAluguel,
    vacancia: sensibilidadeVacancia,
    custos: sensibilidadeCustos,
  };
}

/**
 * Calcula todos os indicadores financeiros
 */
function calcularIndicadores(
  investimentoInicial: number,
  receitaMensalAluguel: number,
  taxaVacancia: number,
  custoOperacionalMensal: number,
  cenarioFinanciamento: CenarioFinanciamento,
  taxaDesconto: number
): Pick<ResultadoFinanceiro, 'tir' | 'vpl' | 'paybackSimples' | 'paybackDescontado'> {
  // Gerar fluxos mensais para 10 anos
  const meses = 120;
  const fluxosMensais: number[] = [-investimentoInicial];
  
  const receitaLiquidaMensal = receitaMensalAluguel * (1 - taxaVacancia / 100);
  const despesaFinanciamentoMensal = cenarioFinanciamento.parcelaMensal;
  
  for (let mes = 1; mes <= meses; mes++) {
    const despesaFinanciamento = mes <= cenarioFinanciamento.prazoMeses 
      ? despesaFinanciamentoMensal 
      : 0;
    
    const fluxo = receitaLiquidaMensal - custoOperacionalMensal - despesaFinanciamento;
    fluxosMensais.push(fluxo);
  }
  
  // Converter fluxos mensais para anuais para cálculo de TIR e VPL
  const fluxosAnuais: number[] = [-investimentoInicial];
  for (let ano = 1; ano <= 10; ano++) {
    const inicioMes = (ano - 1) * 12 + 1;
    const fimMes = ano * 12;
    const fluxoAnual = fluxosMensais.slice(inicioMes, fimMes + 1).reduce((a, b) => a + b, 0);
    fluxosAnuais.push(fluxoAnual);
  }
  
  const tir = calcularTIR(fluxosAnuais);
  const vpl = calcularVPL(fluxosAnuais, taxaDesconto);
  const paybackSimples = calcularPaybackSimples(fluxosMensais);
  const paybackDescontado = calcularPaybackDescontado(fluxosMensais, taxaDesconto);
  
  return {
    tir,
    vpl,
    paybackSimples,
    paybackDescontado,
  };
}

/**
 * Calcula análise financeira avançada completa
 */
export function calcularAnaliseFinanceiraAvancada(
  investimentoInicial: number,
  receitaMensalAluguel: number,
  taxaVacancia: number,
  custoOperacionalMensal: number,
  tipoFinanciamento: 'proprio' | 'bancario' | 'misto',
  percentualFinanciado: number = 0,
  taxaJurosAnual: number = 0,
  prazoFinanciamentoMeses: number = 0,
  taxaDesconto: number = 1000 // 10% ao ano
): ResultadoFinanceiro {
  // Calcular cenário de financiamento
  const valorFinanciado = Math.round(investimentoInicial * percentualFinanciado / 100);
  const parcelaMensal = valorFinanciado > 0 && prazoFinanciamentoMeses > 0
    ? calcularParcelaMensal(valorFinanciado, taxaJurosAnual, prazoFinanciamentoMeses)
    : 0;
  
  const cenarioFinanciamento: CenarioFinanciamento = {
    tipo: tipoFinanciamento,
    percentualFinanciado,
    taxaJurosAnual,
    prazoMeses: prazoFinanciamentoMeses,
    parcelaMensal,
  };
  
  // Gerar projeções de fluxo de caixa
  const fluxoCaixaAnual = gerarProjecoes(
    investimentoInicial,
    receitaMensalAluguel,
    taxaVacancia,
    custoOperacionalMensal,
    cenarioFinanciamento,
    taxaDesconto
  );
  
  // Calcular indicadores principais
  const indicadores = calcularIndicadores(
    investimentoInicial,
    receitaMensalAluguel,
    taxaVacancia,
    custoOperacionalMensal,
    cenarioFinanciamento,
    taxaDesconto
  );
  
  // Análise de sensibilidade
  const analiseSensibilidade = analisarSensibilidade(
    investimentoInicial,
    receitaMensalAluguel,
    taxaVacancia,
    custoOperacionalMensal,
    cenarioFinanciamento,
    taxaDesconto
  );
  
  return {
    ...indicadores,
    fluxoCaixaAnual,
    cenarioFinanciamento,
    analiseSensibilidade,
  };
}
