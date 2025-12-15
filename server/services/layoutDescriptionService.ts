/**
 * Serviço para gerar descrições textuais de layout personalizado
 * para inclusão nos prompts de geração de imagens com IA
 */

export interface BuildingLayout {
  offsetX: number; // -50 a 50
  offsetY: number; // -50 a 50
  rotation: number; // 0 a 360
  scale: number; // 50 a 100
}

/**
 * Gera descrição textual do layout personalizado para prompts de IA
 */
export function generateLayoutDescription(layout: BuildingLayout | null): string {
  if (!layout || (layout.offsetX === 0 && layout.offsetY === 0 && layout.rotation === 0 && layout.scale === 80)) {
    // Layout padrão - sem customização
    return "";
  }

  const parts: string[] = [];

  // Posicionamento horizontal
  if (layout.offsetX !== 0) {
    const direction = layout.offsetX > 0 ? "right" : "left";
    const percentage = Math.abs(layout.offsetX);
    parts.push(`Building positioned ${percentage}% to the ${direction} of lot center`);
  }

  // Posicionamento vertical
  if (layout.offsetY !== 0) {
    const direction = layout.offsetY > 0 ? "back" : "front";
    const percentage = Math.abs(layout.offsetY);
    parts.push(`Building positioned ${percentage}% towards the ${direction} of the lot`);
  }

  // Rotação
  if (layout.rotation !== 0) {
    const cardinalDirection = getCardinalDirection(layout.rotation);
    parts.push(`Building rotated ${layout.rotation}° clockwise (main facade facing ${cardinalDirection})`);
  }

  // Escala
  if (layout.scale !== 80) {
    const sizeDescription = layout.scale > 80 ? "larger" : "smaller";
    parts.push(`Building footprint scaled to ${layout.scale}% of default size (${sizeDescription} than typical)`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `\n\nCUSTOM BUILDING LAYOUT (CRITICAL - MUST FOLLOW EXACTLY):\n- ${parts.join('\n- ')}\n- Ensure the building respects these positioning parameters while staying within lot boundaries\n- Parking and circulation must adapt to this custom building placement`;
}

/**
 * Converte graus de rotação em direção cardeal aproximada
 */
function getCardinalDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  
  if (normalized >= 337.5 || normalized < 22.5) return "North";
  if (normalized >= 22.5 && normalized < 67.5) return "Northeast";
  if (normalized >= 67.5 && normalized < 112.5) return "East";
  if (normalized >= 112.5 && normalized < 157.5) return "Southeast";
  if (normalized >= 157.5 && normalized < 202.5) return "South";
  if (normalized >= 202.5 && normalized < 247.5) return "Southwest";
  if (normalized >= 247.5 && normalized < 292.5) return "West";
  if (normalized >= 292.5 && normalized < 337.5) return "Northwest";
  
  return "North";
}

/**
 * Gera descrição específica para plantas baixas
 */
export function generateFloorplanLayoutDescription(layout: BuildingLayout | null): string {
  if (!layout || (layout.offsetX === 0 && layout.offsetY === 0 && layout.rotation === 0 && layout.scale === 80)) {
    return "";
  }

  const parts: string[] = [];

  // Para plantas, a descrição é mais técnica
  if (layout.offsetX !== 0 || layout.offsetY !== 0) {
    parts.push(`Building footprint offset from lot center: X=${layout.offsetX}%, Y=${layout.offsetY}%`);
  }

  if (layout.rotation !== 0) {
    parts.push(`Building axis rotated ${layout.rotation}° from North-South orientation`);
  }

  if (layout.scale !== 80) {
    parts.push(`Building coverage: ${layout.scale}% of maximum allowable footprint`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `\n\nLAYOUT CONFIGURATION:\n- ${parts.join('\n- ')}\n- Show exact positioning within lot boundaries with dimension lines\n- Indicate setback distances from all property lines`;
}

/**
 * Gera descrição específica para implantação (site plan)
 */
export function generateSiteplanLayoutDescription(layout: BuildingLayout | null): string {
  if (!layout || (layout.offsetX === 0 && layout.offsetY === 0 && layout.rotation === 0 && layout.scale === 80)) {
    return "";
  }

  const parts: string[] = [];

  if (layout.offsetX !== 0 || layout.offsetY !== 0) {
    const xDesc = layout.offsetX > 0 ? `${layout.offsetX}% East` : `${Math.abs(layout.offsetX)}% West`;
    const yDesc = layout.offsetY > 0 ? `${layout.offsetY}% South` : `${Math.abs(layout.offsetY)}% North`;
    parts.push(`Building positioned ${xDesc}, ${yDesc} from geometric center of lot`);
  }

  if (layout.rotation !== 0) {
    parts.push(`Building rotated ${layout.rotation}° clockwise from site grid`);
    parts.push(`Parking layout must adapt to this ${layout.rotation}° rotation angle`);
  }

  if (layout.scale !== 80) {
    parts.push(`Building footprint: ${layout.scale}% of optimized size`);
    parts.push(`Remaining ${100 - layout.scale}% of buildable area allocated to parking and circulation`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `\n\nSITE LAYOUT PARAMETERS:\n- ${parts.join('\n- ')}\n- Parking spaces must be organized around this custom building placement\n- Maintain required setbacks from all property boundaries\n- Optimize circulation paths for this specific configuration`;
}
