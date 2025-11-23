import { validateSetbacks } from './setbackValidationService';

export interface OptimizationInput {
  terrain: {
    width: number;
    length: number;
    area: number;
  };
  setbacks: {
    frontal: number;
    lateral: number;
    fundos: number;
  };
  preferences?: {
    prioritizeOccupancy?: boolean; // Maximizar taxa de ocupação
    prioritizeSolar?: boolean; // Otimizar orientação solar
    minimizeWaste?: boolean; // Minimizar áreas mortas
  };
}

export interface OptimizedLayout {
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  score: number;
  reasoning: string;
  metrics: {
    occupancyRate: number;
    footprintArea: number;
    wastedArea: number;
    solarOrientation: string;
  };
}

/**
 * Otimiza o layout do edifício considerando múltiplos fatores
 */
export function optimizeLayout(input: OptimizationInput): OptimizedLayout {
  const { terrain, setbacks, preferences = {} } = input;

  // Calcular escala máxima permitida considerando recuos
  const maxScale = calculateMaxScale(terrain, setbacks);

  // Calcular posição ideal (centralizada por padrão, mas ajustada pelos recuos)
  const idealPosition = calculateIdealPosition(terrain, setbacks, maxScale);

  // Calcular rotação ideal (orientação solar)
  const idealRotation = calculateIdealRotation(preferences);

  // Validar o layout proposto
  const proposedLayout = {
    offsetX: idealPosition.offsetX,
    offsetY: idealPosition.offsetY,
    rotation: idealRotation,
    scale: maxScale,
  };

  const validation = validateSetbacks(proposedLayout, terrain, setbacks);

  // Se houver violações, ajustar
  let finalLayout = proposedLayout;
  if (!validation.isValid) {
    finalLayout = adjustForViolations(proposedLayout, validation.violations, terrain, setbacks);
  }

  // Calcular métricas
  const buildingWidth = (terrain.width * finalLayout.scale) / 100;
  const buildingHeight = (terrain.length * finalLayout.scale) / 100 * 0.4;
  const footprintArea = buildingWidth * buildingHeight;
  const occupancyRate = (footprintArea / terrain.area) * 100;
  const wastedArea = terrain.area - footprintArea;

  // Calcular score
  let score = 100;
  score += (occupancyRate - 50) * 0.5; // Bonus por aproveitamento
  score -= wastedArea * 0.01; // Penalidade por desperdício
  if (finalLayout.rotation % 90 === 0) score += 10; // Bonus por rotação ortogonal
  score = Math.max(0, Math.min(100, score));

  // Gerar justificativa
  const reasoning = generateReasoning(finalLayout, validation, {
    occupancyRate,
    footprintArea,
    wastedArea,
  });

  return {
    ...finalLayout,
    score,
    reasoning,
    metrics: {
      occupancyRate,
      footprintArea,
      wastedArea,
      solarOrientation: getSolarOrientation(finalLayout.rotation),
    },
  };
}

/**
 * Calcula a escala máxima permitida considerando os recuos
 */
function calculateMaxScale(
  terrain: { width: number; length: number },
  setbacks: { frontal: number; lateral: number; fundos: number }
): number {
  // Área disponível após recuos
  const availableWidth = terrain.width - (setbacks.lateral * 2);
  const availableLength = terrain.length - setbacks.frontal - setbacks.fundos;

  // Calcular percentual de aproveitamento
  const widthRatio = (availableWidth / terrain.width) * 100;
  const lengthRatio = (availableLength / terrain.length) * 100;

  // Usar o menor dos dois para garantir que cabe
  const maxScale = Math.min(widthRatio, lengthRatio);

  // Limitar entre 50% e 95% (deixar margem de segurança)
  return Math.max(50, Math.min(95, maxScale));
}

/**
 * Calcula a posição ideal do edifício
 */
function calculateIdealPosition(
  terrain: { width: number; length: number },
  setbacks: { frontal: number; lateral: number; fundos: number },
  scale: number
): { offsetX: number; offsetY: number } {
  // Centralizar horizontalmente (recuos laterais iguais)
  const offsetX = 0;

  // Verticalmente: considerar diferença entre recuo frontal e fundos
  const frontBackDiff = setbacks.fundos - setbacks.frontal;
  const offsetY = (frontBackDiff / terrain.length) * 50; // Converter para percentual

  return {
    offsetX: Math.max(-50, Math.min(50, offsetX)),
    offsetY: Math.max(-50, Math.min(50, offsetY)),
  };
}

/**
 * Calcula a rotação ideal considerando orientação solar
 */
function calculateIdealRotation(preferences: {
  prioritizeSolar?: boolean;
}): number {
  if (preferences.prioritizeSolar) {
    // Orientação Norte (fachada principal voltada para o Norte)
    // No hemisfério sul, fachadas norte recebem mais sol
    return 0;
  }

  // Sem rotação por padrão
  return 0;
}

/**
 * Ajusta o layout para corrigir violações de recuos
 */
function adjustForViolations(
  layout: { offsetX: number; offsetY: number; rotation: number; scale: number },
  violations: any[],
  terrain: { width: number; length: number },
  setbacks: { frontal: number; lateral: number; fundos: number }
): { offsetX: number; offsetY: number; rotation: number; scale: number } {
  let adjusted = { ...layout };

  // Reduzir escala se houver violações
  if (violations.length > 0) {
    adjusted.scale = Math.max(50, adjusted.scale - 10);
  }

  // Ajustar posição baseado no tipo de violação
  for (const violation of violations) {
    switch (violation.type) {
      case 'frontal':
        adjusted.offsetY += 5; // Mover para trás
        break;
      case 'fundos':
        adjusted.offsetY -= 5; // Mover para frente
        break;
      case 'lateral_esquerda':
        adjusted.offsetX += 5; // Mover para direita
        break;
      case 'lateral_direita':
        adjusted.offsetX -= 5; // Mover para esquerda
        break;
    }
  }

  // Garantir limites
  adjusted.offsetX = Math.max(-50, Math.min(50, adjusted.offsetX));
  adjusted.offsetY = Math.max(-50, Math.min(50, adjusted.offsetY));

  return adjusted;
}

/**
 * Gera justificativa textual para a otimização
 */
function generateReasoning(
  layout: { offsetX: number; offsetY: number; rotation: number; scale: number },
  validation: any,
  metrics: { occupancyRate: number; footprintArea: number; wastedArea: number }
): string {
  const parts: string[] = [];

  // Aproveitamento
  if (metrics.occupancyRate > 70) {
    parts.push(`Excelente aproveitamento do terreno (${metrics.occupancyRate.toFixed(1)}%)`);
  } else if (metrics.occupancyRate > 50) {
    parts.push(`Bom aproveitamento do terreno (${metrics.occupancyRate.toFixed(1)}%)`);
  } else {
    parts.push(`Aproveitamento moderado do terreno (${metrics.occupancyRate.toFixed(1)}%)`);
  }

  // Recuos
  if (validation.isValid) {
    parts.push('todos os recuos obrigatórios respeitados');
  } else {
    parts.push(`${validation.violations.length} ajuste(s) necessário(s) nos recuos`);
  }

  // Rotação
  if (layout.rotation === 0) {
    parts.push('orientação padrão (fachada voltada para frente do terreno)');
  } else if (layout.rotation % 90 === 0) {
    parts.push(`orientação ortogonal (${layout.rotation}°)`);
  } else {
    parts.push(`orientação customizada (${layout.rotation}°)`);
  }

  // Posicionamento
  if (Math.abs(layout.offsetX) < 5 && Math.abs(layout.offsetY) < 5) {
    parts.push('edifício centralizado');
  } else {
    const horizontal = layout.offsetX > 5 ? 'direita' : layout.offsetX < -5 ? 'esquerda' : 'centro';
    const vertical = layout.offsetY > 5 ? 'fundos' : layout.offsetY < -5 ? 'frente' : 'centro';
    parts.push(`posicionado mais para ${horizontal} e ${vertical}`);
  }

  return parts.join(', ') + '.';
}

/**
 * Retorna descrição da orientação solar baseada na rotação
 */
function getSolarOrientation(rotation: number): string {
  const normalized = rotation % 360;

  if (normalized >= 337.5 || normalized < 22.5) return 'Norte';
  if (normalized >= 22.5 && normalized < 67.5) return 'Nordeste';
  if (normalized >= 67.5 && normalized < 112.5) return 'Leste';
  if (normalized >= 112.5 && normalized < 157.5) return 'Sudeste';
  if (normalized >= 157.5 && normalized < 202.5) return 'Sul';
  if (normalized >= 202.5 && normalized < 247.5) return 'Sudoeste';
  if (normalized >= 247.5 && normalized < 292.5) return 'Oeste';
  return 'Noroeste';
}
