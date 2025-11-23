/**
 * Serviço para validação automática de recuos obrigatórios
 * Detecta se o edifício posicionado viola os recuos frontal, lateral e de fundos
 */

export interface SetbackRequirements {
  frontal: number; // metros
  lateral: number; // metros
  fundos: number; // metros
}

export interface BuildingLayout {
  offsetX: number; // -50 a 50 (percentual)
  offsetY: number; // -50 a 50 (percentual)
  rotation: number; // 0 a 360 graus
  scale: number; // 50 a 100 (percentual)
}

export interface TerrainDimensions {
  width: number; // metros
  length: number; // metros
  area: number; // m²
}

export interface SetbackViolation {
  type: "frontal" | "lateral_esquerda" | "lateral_direita" | "fundos";
  required: number; // recuo exigido em metros
  actual: number; // recuo atual em metros
  violation: number; // quanto está violando em metros
  severity: "critical" | "moderate" | "minor";
}

export interface ValidationResult {
  isValid: boolean;
  violations: SetbackViolation[];
  warnings: string[];
  buildingFootprint: {
    width: number; // metros
    height: number; // metros (no plano 2D, representa comprimento)
  };
  actualSetbacks: {
    frontal: number;
    lateral_esquerda: number;
    lateral_direita: number;
    fundos: number;
  };
}

/**
 * Valida se o layout do edifício respeita os recuos obrigatórios
 */
export function validateSetbacks(
  layout: BuildingLayout,
  terrain: TerrainDimensions,
  setbacks: SetbackRequirements
): ValidationResult {
  // Calcular dimensões do edifício baseado na escala
  const buildingWidth = (terrain.width * layout.scale) / 100;
  const buildingHeight = (terrain.length * layout.scale) / 100 * 0.4; // Retangular (40% do comprimento)

  // Calcular posição do centro do edifício
  const centerX = (terrain.width / 2) + ((layout.offsetX / 100) * terrain.width);
  const centerY = (terrain.length / 2) + ((layout.offsetY / 100) * terrain.length);

  // Calcular limites do edifício (sem rotação primeiro)
  let leftEdge = centerX - (buildingWidth / 2);
  let rightEdge = centerX + (buildingWidth / 2);
  let topEdge = centerY - (buildingHeight / 2);
  let bottomEdge = centerY + (buildingHeight / 2);

  // Ajustar para rotação (simplificado - usa bounding box)
  if (layout.rotation !== 0) {
    const rad = (layout.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    
    const rotatedWidth = buildingWidth * cos + buildingHeight * sin;
    const rotatedHeight = buildingWidth * sin + buildingHeight * cos;
    
    leftEdge = centerX - (rotatedWidth / 2);
    rightEdge = centerX + (rotatedWidth / 2);
    topEdge = centerY - (rotatedHeight / 2);
    bottomEdge = centerY + (rotatedHeight / 2);
  }

  // Calcular recuos atuais
  const actualSetbacks = {
    frontal: topEdge, // distância da borda frontal (topo)
    lateral_esquerda: leftEdge, // distância da borda esquerda
    lateral_direita: terrain.width - rightEdge, // distância da borda direita
    fundos: terrain.length - bottomEdge, // distância da borda de fundos (bottom)
  };

  // Detectar violações
  const violations: SetbackViolation[] = [];

  if (actualSetbacks.frontal < setbacks.frontal) {
    violations.push({
      type: "frontal",
      required: setbacks.frontal,
      actual: actualSetbacks.frontal,
      violation: setbacks.frontal - actualSetbacks.frontal,
      severity: getSeverity(setbacks.frontal - actualSetbacks.frontal),
    });
  }

  if (actualSetbacks.lateral_esquerda < setbacks.lateral) {
    violations.push({
      type: "lateral_esquerda",
      required: setbacks.lateral,
      actual: actualSetbacks.lateral_esquerda,
      violation: setbacks.lateral - actualSetbacks.lateral_esquerda,
      severity: getSeverity(setbacks.lateral - actualSetbacks.lateral_esquerda),
    });
  }

  if (actualSetbacks.lateral_direita < setbacks.lateral) {
    violations.push({
      type: "lateral_direita",
      required: setbacks.lateral,
      actual: actualSetbacks.lateral_direita,
      violation: setbacks.lateral - actualSetbacks.lateral_direita,
      severity: getSeverity(setbacks.lateral - actualSetbacks.lateral_direita),
    });
  }

  if (actualSetbacks.fundos < setbacks.fundos) {
    violations.push({
      type: "fundos",
      required: setbacks.fundos,
      actual: actualSetbacks.fundos,
      violation: setbacks.fundos - actualSetbacks.fundos,
      severity: getSeverity(setbacks.fundos - actualSetbacks.fundos),
    });
  }

  // Gerar avisos
  const warnings: string[] = [];
  
  if (violations.length > 0) {
    warnings.push(`⚠️ ${violations.length} violação(ões) de recuo detectada(s)`);
  }

  if (layout.rotation !== 0 && layout.rotation % 90 !== 0) {
    warnings.push("⚠️ Rotação não-ortogonal pode dificultar aprovação");
  }

  const occupancyRate = ((buildingWidth * buildingHeight) / terrain.area) * 100;
  if (occupancyRate > 70) {
    warnings.push(`⚠️ Taxa de ocupação alta (${occupancyRate.toFixed(1)}%)`);
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    buildingFootprint: {
      width: buildingWidth,
      height: buildingHeight,
    },
    actualSetbacks,
  };
}

/**
 * Determina a severidade da violação baseada na magnitude
 */
function getSeverity(violationMeters: number): "critical" | "moderate" | "minor" {
  if (violationMeters >= 2.0) return "critical";
  if (violationMeters >= 1.0) return "moderate";
  return "minor";
}

/**
 * Gera descrição textual das violações para exibição ao usuário
 */
export function formatViolationMessage(violation: SetbackViolation): string {
  const typeNames = {
    frontal: "Recuo Frontal",
    lateral_esquerda: "Recuo Lateral Esquerdo",
    lateral_direita: "Recuo Lateral Direito",
    fundos: "Recuo de Fundos",
  };

  return `${typeNames[violation.type]}: Exigido ${violation.required.toFixed(2)}m, atual ${violation.actual.toFixed(2)}m (faltam ${violation.violation.toFixed(2)}m)`;
}

/**
 * Gera sugestão de correção automática para resolver violações
 */
export function suggestCorrection(
  layout: BuildingLayout,
  violations: SetbackViolation[]
): BuildingLayout {
  if (violations.length === 0) return layout;

  let correctedLayout = { ...layout };

  // Tentar reduzir escala primeiro (menos invasivo)
  const maxViolation = Math.max(...violations.map(v => v.violation));
  if (maxViolation > 0) {
    const scaleReduction = Math.min(10, maxViolation * 2); // Reduzir até 10%
    correctedLayout.scale = Math.max(50, correctedLayout.scale - scaleReduction);
  }

  // Se ainda houver violações, ajustar posição
  for (const violation of violations) {
    switch (violation.type) {
      case "frontal":
        correctedLayout.offsetY = Math.max(-50, correctedLayout.offsetY + 5);
        break;
      case "fundos":
        correctedLayout.offsetY = Math.min(50, correctedLayout.offsetY - 5);
        break;
      case "lateral_esquerda":
        correctedLayout.offsetX = Math.max(-50, correctedLayout.offsetX + 5);
        break;
      case "lateral_direita":
        correctedLayout.offsetX = Math.min(50, correctedLayout.offsetX - 5);
        break;
    }
  }

  return correctedLayout;
}
