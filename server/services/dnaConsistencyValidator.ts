/**
 * DNA Consistency Validator
 * 
 * Valida se o DNA do projeto contém todas as informações necessárias
 * e específicas para garantir consistência entre todos os estudos gerados.
 */

import { ProjectDNA } from './projectDNAService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida se o DNA contém especificações obrigatórias e detalhadas
 */
export function validateDNAConsistency(dna: ProjectDNA): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar cores (devem ser HEX válidos)
  if (!isValidHexColor(dna.primaryColor)) {
    errors.push(`Cor principal inválida: "${dna.primaryColor}". Deve ser formato HEX (#RRGGBB)`);
  }
  if (!isValidHexColor(dna.accentColor)) {
    errors.push(`Cor de destaque inválida: "${dna.accentColor}". Deve ser formato HEX (#RRGGBB)`);
  }

  // Validar que cores não são genéricas
  if (dna.primaryColor.toLowerCase() === '#ffffff' || dna.primaryColor.toLowerCase() === '#000000') {
    warnings.push('Cor principal muito genérica (branco puro ou preto puro). Considere tons mais específicos.');
  }

  // Validar materiais (devem ter especificações técnicas)
  if (dna.materials.length < 3) {
    errors.push(`Materiais insuficientes: ${dna.materials.length}. Mínimo 3 materiais especificados.`);
  }

  dna.materials.forEach((material, index) => {
    if (material.length < 20) {
      warnings.push(`Material ${index + 1} muito vago: "${material}". Adicione especificações técnicas.`);
    }
    if (!material.includes('OBRIGATÓRIO') && !material.includes(':') && !material.includes('#')) {
      warnings.push(`Material ${index + 1} sem detalhes: "${material}". Especifique tipo, cor ou dimensões.`);
    }
  });

  // Validar features (devem ter elementos obrigatórios)
  const hasObrigatoryFeatures = dna.features.some(f => f.includes('OBRIGATÓRIO'));
  if (!hasObrigatoryFeatures) {
    warnings.push('Nenhuma característica marcada como OBRIGATÓRIA. Adicione elementos essenciais.');
  }

  if (dna.features.length < 5) {
    warnings.push(`Poucas características definidas: ${dna.features.length}. Recomendado mínimo 5 para consistência.`);
  }

  // Validar paisagismo (deve ter espécies específicas)
  if (!dna.landscaping.includes('OBRIGATÓRIO') && !hasSpecificPlantNames(dna.landscaping)) {
    warnings.push('Paisagismo muito genérico. Especifique espécies de plantas e dimensões.');
  }

  // Validar layout (deve ter dimensões específicas)
  if (!dna.layout.includes('OBRIGATÓRIO') && !hasDimensions(dna.layout)) {
    warnings.push('Layout sem dimensões específicas. Adicione medidas (m, m², etc.).');
  }

  // Validar contexto (deve mencionar clima ou localização)
  if (!dna.context.toLowerCase().includes('clima') && 
      !dna.context.toLowerCase().includes('brasil') &&
      !dna.context.toLowerCase().includes('tropical')) {
    warnings.push('Contexto sem referência climática ou geográfica. Adicione informações de localização.');
  }

  // Validar estilo (não deve ser genérico)
  const genericStyles = ['moderno', 'contemporâneo', 'minimalista'];
  const isGenericStyle = genericStyles.some(generic => 
    dna.style.toLowerCase() === generic
  );
  if (isGenericStyle) {
    warnings.push(`Estilo muito genérico: "${dna.style}". Especifique subtipo ou contexto (ex: "Minimalista Comercial Brasileiro").`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida se uma string é uma cor HEX válida
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Verifica se o texto contém nomes específicos de plantas
 */
function hasSpecificPlantNames(text: string): boolean {
  const plantKeywords = ['ipê', 'jacarandá', 'resedá', 'sibipiruna', 'oiti', 'pau-brasil', 
                         'quaresmeira', 'palmeira', 'bambu', 'grama', 'lambari'];
  return plantKeywords.some(plant => text.toLowerCase().includes(plant));
}

/**
 * Verifica se o texto contém dimensões específicas
 */
function hasDimensions(text: string): boolean {
  // Procura por padrões como "3m", "4-5m", "100m²", "3-4m de largura"
  return /\d+(-\d+)?\s*(m|m²|metros|cm)/.test(text);
}

/**
 * Gera relatório de validação formatado
 */
export function formatValidationReport(result: ValidationResult): string {
  let report = '=== VALIDAÇÃO DE CONSISTÊNCIA DO DNA ===\n\n';

  if (result.isValid) {
    report += '✅ DNA VÁLIDO - Todas as verificações obrigatórias passaram.\n\n';
  } else {
    report += '❌ DNA INVÁLIDO - Erros encontrados:\n\n';
    result.errors.forEach((error, i) => {
      report += `${i + 1}. ${error}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += '⚠️  AVISOS (recomendações para melhorar consistência):\n\n';
    result.warnings.forEach((warning, i) => {
      report += `${i + 1}. ${warning}\n`;
    });
  }

  return report;
}
