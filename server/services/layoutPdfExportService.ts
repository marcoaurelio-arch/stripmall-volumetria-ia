import { validateSetbacks } from './setbackValidationService';

interface LayoutForExport {
  id: number;
  name: string;
  description?: string | null;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  isValid: number;
}

interface ExportInput {
  projectName: string;
  layouts: LayoutForExport[];
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
}

/**
 * Gera conteúdo Markdown para comparação de layouts
 * Este markdown pode ser convertido para PDF usando o conversor CLI configurado no ambiente
 */
export function generateLayoutComparisonMarkdown(input: ExportInput): string {
  const { projectName, layouts, terrain, setbacks } = input;

  let markdown = `# Comparação de Layouts\n\n`;
  markdown += `**Projeto:** ${projectName}\n\n`;
  markdown += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  markdown += `---\n\n`;

  // Informações do Terreno
  markdown += `## Informações do Terreno\n\n`;
  markdown += `- **Área Total:** ${terrain.area} m²\n`;
  markdown += `- **Dimensões:** ${terrain.width}m × ${terrain.length}m\n`;
  markdown += `- **Recuo Frontal:** ${setbacks.frontal}m\n`;
  markdown += `- **Recuo Lateral:** ${setbacks.lateral}m\n`;
  markdown += `- **Recuo de Fundos:** ${setbacks.fundos}m\n\n`;
  markdown += `---\n\n`;

  // Tabela Comparativa
  markdown += `## Tabela Comparativa\n\n`;
  markdown += `| Layout | Taxa de Ocupação | Área Construída | Área Desperdiçada | Recuos | Score |\n`;
  markdown += `|--------|------------------|-----------------|-------------------|--------|-------|\n`;

  let bestLayout: { name: string; score: number } | null = null;
  const layoutMetrics: Array<{
    layout: LayoutForExport;
    occupancyRate: number;
    footprintArea: number;
    wastedArea: number;
    validation: any;
    score: number;
  }> = [];

  for (const layout of layouts) {
    // Calcular métricas
    const buildingWidth = (terrain.width * layout.scale) / 100;
    const buildingHeight = (terrain.length * layout.scale) / 100 * 0.4;
    const footprintArea = buildingWidth * buildingHeight;
    const occupancyRate = (footprintArea / terrain.area) * 100;
    const wastedArea = terrain.area - footprintArea;

    // Validação
    const validation = validateSetbacks(
      { offsetX: layout.offsetX, offsetY: layout.offsetY, rotation: layout.rotation, scale: layout.scale },
      terrain,
      setbacks
    );

    // Score
    let score = 100;
    score -= validation.violations.length * 20;
    score += Math.max(0, (occupancyRate - 50) / 10) * 10;
    score = Math.max(0, Math.min(100, score));

    layoutMetrics.push({ layout, occupancyRate, footprintArea, wastedArea, validation, score });

    if (!bestLayout || score > bestLayout.score) {
      bestLayout = { name: layout.name, score };
    }

    // Linha da tabela
    const recuosStatus = validation.isValid ? '✅ OK' : `❌ ${validation.violations.length} erro(s)`;
    markdown += `| ${layout.name} | ${occupancyRate.toFixed(1)}% | ${footprintArea.toFixed(2)} m² | ${wastedArea.toFixed(2)} m² | ${recuosStatus} | ${score.toFixed(0)}/100 |\n`;
  }

  markdown += `\n---\n\n`;

  // Detalhes de cada layout
  markdown += `## Detalhes dos Layouts\n\n`;

  for (const { layout, occupancyRate, footprintArea, wastedArea, validation, score } of layoutMetrics) {
    markdown += `### ${layout.name}\n\n`;

    if (layout.description) {
      markdown += `**Descrição:** ${layout.description}\n\n`;
    }

    markdown += `**Parâmetros:**\n`;
    markdown += `- Posição X: ${layout.offsetX}%\n`;
    markdown += `- Posição Y: ${layout.offsetY}%\n`;
    markdown += `- Rotação: ${layout.rotation}°\n`;
    markdown += `- Escala: ${layout.scale}%\n\n`;

    markdown += `**Métricas:**\n`;
    markdown += `- Taxa de Ocupação: ${occupancyRate.toFixed(1)}%\n`;
    markdown += `- Área Construída: ${footprintArea.toFixed(2)} m²\n`;
    markdown += `- Área Desperdiçada: ${wastedArea.toFixed(2)} m²\n`;
    markdown += `- Score Geral: ${score.toFixed(0)}/100\n\n`;

    markdown += `**Validação de Recuos:**\n\n`;
    if (validation.isValid) {
      markdown += `✅ **Todos os recuos obrigatórios respeitados**\n\n`;
      markdown += `- Recuo Frontal: ${validation.actualSetbacks.frontal.toFixed(2)}m (exigido: ${setbacks.frontal}m)\n`;
      markdown += `- Recuo Lateral Esquerda: ${validation.actualSetbacks.lateral_esquerda.toFixed(2)}m (exigido: ${setbacks.lateral}m)\n`;
      markdown += `- Recuo Lateral Direita: ${validation.actualSetbacks.lateral_direita.toFixed(2)}m (exigido: ${setbacks.lateral}m)\n`;
      markdown += `- Recuo de Fundos: ${validation.actualSetbacks.fundos.toFixed(2)}m (exigido: ${setbacks.fundos}m)\n\n`;
    } else {
      markdown += `❌ **${validation.violations.length} violação(ões) detectada(s):**\n\n`;
      for (const violation of validation.violations) {
        markdown += `- **${violation.type}:** Exigido ${violation.required}m, atual ${violation.actual.toFixed(2)}m (faltam ${violation.violation.toFixed(2)}m)\n`;
      }
      markdown += `\n`;
    }

    if (validation.warnings.length > 0) {
      markdown += `**Avisos:**\n\n`;
      for (const warning of validation.warnings) {
        markdown += `- ${warning}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  // Recomendação
  if (bestLayout) {
    markdown += `## 🎯 Recomendação\n\n`;
    markdown += `O layout **"${bestLayout.name}"** apresenta o melhor score geral (**${bestLayout.score.toFixed(0)}/100**) considerando:\n\n`;
    markdown += `- Maximização do aproveitamento do terreno\n`;
    markdown += `- Respeito aos recuos obrigatórios\n`;
    markdown += `- Minimização de áreas desperdiçadas\n`;
    markdown += `- Orientação e posicionamento adequados\n\n`;
    markdown += `Este layout é **recomendado** para prosseguir com o projeto.\n\n`;
  }

  // Rodapé
  markdown += `---\n\n`;
  markdown += `*Relatório gerado automaticamente pelo sistema Strip Mall Volumetria IA*\n`;

  return markdown;
}
