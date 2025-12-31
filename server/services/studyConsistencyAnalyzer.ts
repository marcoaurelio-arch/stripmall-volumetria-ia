/**
 * Study Consistency Analyzer
 * 
 * Analisa se os estudos gerados (conceitual, plantas, cortes, fachadas)
 * seguem o DNA do projeto de forma consistente.
 */

import { ProjectDNA } from './projectDNAService';

export interface StudyMetadata {
  type: 'conceptual' | 'floorplan' | 'section' | 'facade';
  imageUrl?: string;
  generatedAt?: Date;
  prompt?: string;
}

export interface ConsistencyIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'color' | 'material' | 'feature' | 'style' | 'layout';
  description: string;
  expected: string;
  found?: string;
}

export interface StudyAnalysisResult {
  studyType: string;
  score: number; // 0-100
  issues: ConsistencyIssue[];
  strengths: string[];
}

export interface ConsistencyReport {
  projectName: string;
  dna: ProjectDNA;
  overallScore: number; // 0-100
  studyAnalyses: StudyAnalysisResult[];
  summary: string;
  recommendations: string[];
  generatedAt: Date;
}

/**
 * Analisa a consistência de um estudo específico com o DNA
 */
export function analyzeStudyConsistency(
  study: StudyMetadata,
  dna: ProjectDNA
): StudyAnalysisResult {
  const issues: ConsistencyIssue[] = [];
  const strengths: string[] = [];

  // Análise baseada no tipo de estudo
  switch (study.type) {
    case 'conceptual':
      analyzeConceptualStudy(study, dna, issues, strengths);
      break;
    case 'floorplan':
      analyzeFloorplanStudy(study, dna, issues, strengths);
      break;
    case 'section':
      analyzeSectionStudy(study, dna, issues, strengths);
      break;
    case 'facade':
      analyzeFacadeStudy(study, dna, issues, strengths);
      break;
  }

  // Calcular score baseado nos issues
  const score = calculateConsistencyScore(issues);

  return {
    studyType: getStudyTypeName(study.type),
    score,
    issues,
    strengths,
  };
}

/**
 * Analisa estudo conceitual
 */
function analyzeConceptualStudy(
  study: StudyMetadata,
  dna: ProjectDNA,
  issues: ConsistencyIssue[],
  strengths: string[]
): void {
  // Verificar se prompt menciona cores do DNA
  if (study.prompt && typeof study.prompt === 'string') {
    if (!study.prompt.includes(dna.primaryColor)) {
      issues.push({
        severity: 'warning',
        category: 'color',
        description: 'Cor principal do DNA não mencionada explicitamente no prompt',
        expected: `Cor ${dna.primaryColor}`,
      });
    } else {
      strengths.push(`Cor principal ${dna.primaryColor} especificada no prompt`);
    }

    if (!study.prompt.includes(dna.accentColor)) {
      issues.push({
        severity: 'warning',
        category: 'color',
        description: 'Cor de destaque do DNA não mencionada no prompt',
        expected: `Cor ${dna.accentColor}`,
      });
    } else {
      strengths.push(`Cor de destaque ${dna.accentColor} especificada no prompt`);
    }

    // Verificar features obrigatórias
    const mandatoryFeatures = dna.features.filter(f => f.includes('OBRIGATÓRIO'));
    mandatoryFeatures.forEach(feature => {
      const featureKeyword = extractKeyword(feature);
      if (!study.prompt!.toLowerCase().includes(featureKeyword.toLowerCase())) {
        issues.push({
          severity: 'error',
          category: 'feature',
          description: 'Feature obrigatória não mencionada no prompt',
          expected: feature,
        });
      } else {
        strengths.push(`Feature obrigatória presente: ${featureKeyword}`);
      }
    });

    // Verificar materiais
    dna.materials.forEach((material, index) => {
      const materialKeyword = extractKeyword(material);
      if (!study.prompt!.toLowerCase().includes(materialKeyword.toLowerCase())) {
        issues.push({
          severity: 'warning',
          category: 'material',
          description: `Material ${index + 1} não mencionado no prompt`,
          expected: material,
        });
      } else {
        strengths.push(`Material especificado: ${materialKeyword}`);
      }
    });

    // Verificar estilo
    if (!study.prompt.includes(dna.style)) {
      issues.push({
        severity: 'info',
        category: 'style',
        description: 'Estilo arquitetônico não mencionado literalmente',
        expected: dna.style,
      });
    } else {
      strengths.push(`Estilo ${dna.style} especificado`);
    }
  }
}

/**
 * Analisa planta baixa
 */
function analyzeFloorplanStudy(
  study: StudyMetadata,
  dna: ProjectDNA,
  issues: ConsistencyIssue[],
  strengths: string[]
): void {
  if (study.prompt && typeof study.prompt === 'string') {
    // Verificar layout obrigatório
    if (dna.layout.includes('OBRIGATÓRIO') || dna.layout.includes('CONFIGURAÇÃO')) {
      const layoutKeywords = ['calçada coberta', 'estacionamento', 'linear', 'L'];
      const hasLayoutKeyword = layoutKeywords.some(keyword =>
        study.prompt!.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!hasLayoutKeyword) {
        issues.push({
          severity: 'error',
          category: 'layout',
          description: 'Configuração de layout obrigatória não especificada',
          expected: dna.layout,
        });
      } else {
        strengths.push('Configuração de layout especificada');
      }
    }

    // Verificar dimensões
    const hasDimensions = /\d+(-\d+)?\s*(m|m²)/.test(study.prompt);
    if (!hasDimensions) {
      issues.push({
        severity: 'warning',
        category: 'layout',
        description: 'Dimensões específicas não encontradas no prompt',
        expected: 'Dimensões em metros (m) ou metros quadrados (m²)',
      });
    } else {
      strengths.push('Dimensões específicas incluídas');
    }
  }
}

/**
 * Analisa corte arquitetônico
 */
function analyzeSectionStudy(
  study: StudyMetadata,
  dna: ProjectDNA,
  issues: ConsistencyIssue[],
  strengths: string[]
): void {
  if (study.prompt && typeof study.prompt === 'string') {
    // Verificar materiais estruturais
    const structuralKeywords = ['concreto', 'estrutura', 'pilares', 'laje'];
    const hasStructural = structuralKeywords.some(keyword =>
      study.prompt!.toLowerCase().includes(keyword)
    );

    if (!hasStructural) {
      issues.push({
        severity: 'warning',
        category: 'material',
        description: 'Materiais estruturais não especificados no corte',
        expected: 'Concreto, estrutura, pilares ou laje',
      });
    } else {
      strengths.push('Materiais estruturais especificados');
    }

    // Verificar tipo de cobertura
    if (!study.prompt.toLowerCase().includes(dna.roofType.toLowerCase())) {
      issues.push({
        severity: 'warning',
        category: 'feature',
        description: 'Tipo de cobertura do DNA não mencionado',
        expected: dna.roofType,
      });
    } else {
      strengths.push(`Cobertura ${dna.roofType} especificada`);
    }
  }
}

/**
 * Analisa fachada
 */
function analyzeFacadeStudy(
  study: StudyMetadata,
  dna: ProjectDNA,
  issues: ConsistencyIssue[],
  strengths: string[]
): void {
  if (study.prompt && typeof study.prompt === 'string') {
    // Verificar cores na fachada
    if (!study.prompt.includes(dna.primaryColor) && !study.prompt.includes(dna.accentColor)) {
      issues.push({
        severity: 'error',
        category: 'color',
        description: 'Nenhuma cor do DNA especificada na fachada',
        expected: `${dna.primaryColor} e ${dna.accentColor}`,
      });
    } else {
      strengths.push('Cores do DNA especificadas na fachada');
    }

    // Verificar materiais de fachada
    const facadeMaterials = dna.materials.filter(m =>
      m.toLowerCase().includes('fachada') || m.toLowerCase().includes('vidro') || m.toLowerCase().includes('revestimento')
    );

    if (facadeMaterials.length > 0) {
      const hasFacadeMaterial = facadeMaterials.some(material => {
        const keyword = extractKeyword(material);
        return study.prompt!.toLowerCase().includes(keyword.toLowerCase());
      });

      if (!hasFacadeMaterial) {
        issues.push({
          severity: 'warning',
          category: 'material',
          description: 'Materiais de fachada do DNA não especificados',
          expected: facadeMaterials.join(', '),
        });
      } else {
        strengths.push('Materiais de fachada do DNA incluídos');
      }
    }
  }
}

/**
 * Extrai palavra-chave principal de uma string
 */
function extractKeyword(text: string): string {
  // Remove prefixos como "OBRIGATÓRIO:", "ESTRUTURA:", etc
  const cleaned = text.replace(/^[A-Z]+:\s*/i, '');
  
  // Pega as primeiras 2-3 palavras significativas
  const words = cleaned.split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 3).join(' ');
}

/**
 * Calcula score de consistência baseado nos issues
 */
function calculateConsistencyScore(issues: ConsistencyIssue[]): number {
  let score = 100;

  issues.forEach(issue => {
    switch (issue.severity) {
      case 'error':
        score -= 15;
        break;
      case 'warning':
        score -= 8;
        break;
      case 'info':
        score -= 3;
        break;
    }
  });

  return Math.max(0, score);
}

/**
 * Gera relatório completo de consistência
 */
export function generateConsistencyReport(
  projectName: string,
  dna: ProjectDNA,
  studies: StudyMetadata[]
): ConsistencyReport {
  const studyAnalyses = studies.map(study => analyzeStudyConsistency(study, dna));

  // Calcular score geral (média ponderada)
  const overallScore = studyAnalyses.length > 0
    ? Math.round(studyAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) / studyAnalyses.length)
    : 0;

  // Gerar resumo
  const summary = generateSummary(overallScore, studyAnalyses);

  // Gerar recomendações
  const recommendations = generateRecommendations(studyAnalyses);

  return {
    projectName,
    dna,
    overallScore,
    studyAnalyses,
    summary,
    recommendations,
    generatedAt: new Date(),
  };
}

/**
 * Gera resumo textual do relatório
 */
function generateSummary(overallScore: number, analyses: StudyAnalysisResult[]): string {
  if (overallScore >= 90) {
    return `Excelente consistência! Os estudos seguem rigorosamente o DNA do projeto (${overallScore}%).`;
  } else if (overallScore >= 75) {
    return `Boa consistência geral (${overallScore}%), mas há alguns pontos de atenção que podem ser melhorados.`;
  } else if (overallScore >= 60) {
    return `Consistência moderada (${overallScore}%). Recomenda-se revisar os estudos para maior alinhamento com o DNA.`;
  } else {
    return `Baixa consistência detectada (${overallScore}%). Os estudos apresentam divergências significativas em relação ao DNA do projeto.`;
  }
}

/**
 * Gera recomendações baseadas nas análises
 */
function generateRecommendations(analyses: StudyAnalysisResult[]): string[] {
  const recommendations: string[] = [];

  // Contar issues por categoria
  const issuesByCategory: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.issues.forEach(issue => {
      issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    });
  });

  // Gerar recomendações baseadas nas categorias mais problemáticas
  const sortedCategories = Object.entries(issuesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  sortedCategories.forEach(([category, count]) => {
    switch (category) {
      case 'color':
        recommendations.push(`Reforce as cores do DNA (${count} divergências): especifique cores HEX exatas em todos os prompts.`);
        break;
      case 'material':
        recommendations.push(`Materiais inconsistentes (${count} casos): inclua materiais específicos do DNA em cada tipo de estudo.`);
        break;
      case 'feature':
        recommendations.push(`Features obrigatórias ausentes (${count} casos): garanta que elementos marcados como OBRIGATÓRIO apareçam em todos os estudos.`);
        break;
      case 'layout':
        recommendations.push(`Layout divergente (${count} casos): siga rigorosamente a configuração de layout definida no DNA.`);
        break;
      case 'style':
        recommendations.push(`Estilo arquitetônico inconsistente (${count} casos): mencione explicitamente o estilo do DNA em cada prompt.`);
        break;
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Parabéns! Todos os estudos estão altamente consistentes com o DNA do projeto.');
    recommendations.push('Continue seguindo as especificações detalhadas do DNA para manter a qualidade.');
  } else {
    recommendations.push('Considere regenerar o DNA do projeto (botão "Regenerar") se os dados do projeto mudaram recentemente.');
  }

  return recommendations;
}

/**
 * Retorna nome amigável do tipo de estudo
 */
function getStudyTypeName(type: string): string {
  const names: Record<string, string> = {
    conceptual: 'Estudo Conceitual',
    floorplan: 'Planta Baixa',
    section: 'Corte Arquitetônico',
    facade: 'Fachada',
  };
  return names[type] || type;
}
