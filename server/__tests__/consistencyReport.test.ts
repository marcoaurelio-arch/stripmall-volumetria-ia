import { describe, it, expect } from 'vitest';
import { generateConsistencyReport, StudyMetadata } from '../services/studyConsistencyAnalyzer';
import { ProjectDNA } from '../services/projectDNAService';

describe('Consistency Report Generation', () => {
  const mockDNA: ProjectDNA = {
    buildingShape: 'Volumes retangulares escalonados',
    floors: 1,
    roofType: 'Laje plana impermeabilizada',
    style: 'Moderno Minimalista com linhas retas',
    features: ['Calçada coberta 3-4m', 'Vitrines 70-80%', 'Pilares 6-8m'],
    primaryColor: '#F5F5F5',
    accentColor: '#2C3E50',
    materials: ['Concreto aparente', 'Vidro temperado', 'Aço corten'],
    landscaping: 'Palmeiras imperiais, Ipês amarelos',
    layout: 'Lojas alinhadas com recuo frontal 3m',
    context: 'Clima tropical/subtropical brasileiro',
  };

  const mockStudies: StudyMetadata[] = [
    {
      type: 'conceptual',
      imageUrl: 'https://example.com/conceptual.jpg',
      generatedAt: new Date(),
      prompt: 'Strip mall moderno minimalista com concreto aparente, vidro temperado, cores #F5F5F5 e #2C3E50, palmeiras imperiais',
    },
    {
      type: 'floorplan',
      imageUrl: 'https://example.com/floorplan.jpg',
      generatedAt: new Date(),
      prompt: 'Planta baixa strip mall com lojas alinhadas, recuo frontal 3m, calçada coberta 4m, vitrines 75%',
    },
  ];

  it('deve gerar relatório de consistência com score', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    expect(report).toBeDefined();
    expect(report.projectName).toBe('Projeto Teste');
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.summary).toBeDefined();
    expect(report.dna).toEqual(mockDNA);
    expect(report.studyAnalyses).toHaveLength(2);
  });

  it('deve analisar cores do DNA nos prompts', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    const conceptualStudy = report.studyAnalyses.find(s => s.studyType === 'Estudo Conceitual');
    expect(conceptualStudy).toBeDefined();
    // Verificar que não há issues de cor
    const hasColorIssue = conceptualStudy!.issues.some(i => i.category === 'color');
    expect(hasColorIssue).toBe(false);
  });

  it('deve analisar materiais do DNA nos prompts', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    const conceptualStudy = report.studyAnalyses.find(s => s.studyType === 'Estudo Conceitual');
    expect(conceptualStudy).toBeDefined();
    // Verificar que o score é alto (indica boa consistência de materiais)
    expect(conceptualStudy!.score).toBeGreaterThan(70);
  });

  it('deve analisar features obrigatórias nos prompts', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    const floorplanStudy = report.studyAnalyses.find(s => s.studyType === 'Planta Baixa');
    expect(floorplanStudy).toBeDefined();
    // Verificar que não há issues de features
    const hasFeatureIssue = floorplanStudy!.issues.some(i => i.category === 'feature');
    expect(hasFeatureIssue).toBe(false);
  });

  it('deve calcular score individual por estudo', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    report.studyAnalyses.forEach(study => {
      expect(study.score).toBeGreaterThanOrEqual(0);
      expect(study.score).toBeLessThanOrEqual(100);
    });
  });

  it('deve gerar pontos fortes quando consistência é alta', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    // Verificar que há análises com strengths
    const hasStrengths = report.studyAnalyses.some(s => s.strengths.length > 0);
    expect(hasStrengths).toBe(true);
  });

  it('deve gerar pontos de atenção quando consistência é baixa', () => {
    const mockStudiesInconsistent: StudyMetadata[] = [
      {
        type: 'conceptual',
        imageUrl: 'https://example.com/conceptual.jpg',
        generatedAt: new Date(),
        prompt: 'Strip mall genérico sem especificações',
      },
    ];

    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudiesInconsistent);

    // Verificar que há issues detectados
    const hasIssues = report.studyAnalyses.some(s => s.issues.length > 0);
    expect(hasIssues).toBe(true);
  });

  it('deve gerar recomendações automáticas', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    expect(report.recommendations).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it('deve lidar com estudos sem prompt', () => {
    const mockStudiesNoPrompt: StudyMetadata[] = [
      {
        type: 'conceptual',
        imageUrl: 'https://example.com/conceptual.jpg',
        generatedAt: new Date(),
        prompt: undefined,
      },
    ];

    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudiesNoPrompt);

    expect(report).toBeDefined();
    expect(report.studyAnalyses).toHaveLength(1);
    expect(report.studyAnalyses[0].score).toBeLessThanOrEqual(100);
  });

  it('deve calcular score geral como média dos scores individuais', () => {
    const report = generateConsistencyReport('Projeto Teste', mockDNA, mockStudies);

    const avgScore = Math.round(report.studyAnalyses.reduce((sum, s) => sum + s.score, 0) / report.studyAnalyses.length);
    expect(report.overallScore).toBe(avgScore);
  });
});
