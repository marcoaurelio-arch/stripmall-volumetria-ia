import { describe, it, expect } from 'vitest';
import { buildProjectContextFromData } from '../services/projectContextHelper';

describe('Consistency Validation Tests', () => {
  const mockProject = {
    id: 1,
    name: 'Teste Consistência',
    briefing: 'Strip mall comercial de médio porte com supermercado âncora, farmácia, padaria e lojas satélites. Foco em conveniência para bairro residencial.',
    totalArea: 5000,
    width: 80,
    length: 62.5,
    occupancyRate: 70,
    buildingCoefficient: 125,
    frontSetback: 5,
    sideSetback: 3,
    backSetback: 3,
    userId: 1,
    status: 'completed' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnalysis = {
    totalStores: 12,
    averageStoreArea: 150,
    anchorStoreArea: 800,
    satelliteStoresArea: 1000,
    circulationArea: 400,
    parkingSpaces: 45,
    buildableArea: 3500,
    totalBuiltArea: 3500,
    occupiedArea: 2800,
    greenArea: 500,
    recommendations: [
      'Posicionar supermercado âncora em uma das extremidades',
      'Criar corredor coberto conectando todas as lojas',
      'Estacionamento frontal com acesso direto às lojas'
    ]
  };

  const mockDNA = {
    buildingShape: 'Edifício linear horizontal com corredor central',
    style: 'Contemporâneo comercial com elementos de concreto e vidro',
    floors: 1,
    roofType: 'Laje impermeabilizada',
    features: ['Corredor central coberto', 'Fachada envidraçada'],
    primaryColor: '#FFFFFF',
    accentColor: '#2563EB',
    materials: ['Concreto aparente', 'vidro temperado', 'ACM branco'],
    landscaping: 'Árvores de médio porte (6-8m) no estacionamento, canteiros com vegetação baixa',
    layout: 'Supermercado âncora na extremidade, lojas satélites em sequência linear, estacionamento frontal',
    context: 'Bairro residencial em expansão'
  };

  describe('buildProjectContextFromData', () => {
    it('deve incluir todos os dados essenciais do projeto', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);

      expect(context).toHaveProperty('briefing');
      expect(context).toHaveProperty('terrain');
      expect(context).toHaveProperty('analysis');
      expect(context).toHaveProperty('dna');
      expect(context).toHaveProperty('criticalRequirements');
    });

    it('deve incluir dados corretos do terreno', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);

      expect(context.terrain).toContain('5.000 m²');
      expect(context.terrain).toContain('80m × 62.5m');
      expect(context.terrain).toContain('70%');
      expect(context.terrain).toContain('1.25');
    });

    it('deve incluir dados corretos da análise volumétrica', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);

      expect(context.analysis).toContain('12 lojas');
      expect(context.analysis).toContain('800 m²');
      expect(context.analysis).toContain('3.500 m²');
      expect(context.analysis).toContain('45 vagas');
    });

    it('deve incluir DNA arquitetônico completo', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);

      expect(context.dna).toContain('Edifício linear horizontal');
      expect(context.dna).toContain('Contemporâneo comercial');
      expect(context.dna).toContain('Concreto aparente');
      expect(context.dna).toContain('Árvores de médio porte');
    });

    it('deve incluir requisitos críticos de consistência', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);

      expect(context.criticalRequirements).toContain('EXATAMENTE 12 lojas');
      expect(context.criticalRequirements).toContain('Loja âncora (supermercado) de 800 m²');
      expect(context.criticalRequirements).toMatch(/3[.,]?500 m²/);
      expect(context.criticalRequirements).toContain('45 vagas de estacionamento');
    });

    it('deve funcionar com análise nula', () => {
      const context = buildProjectContextFromData(mockProject, null, mockDNA);

      expect(context).toHaveProperty('briefing');
      expect(context).toHaveProperty('terrain');
      expect(context).toHaveProperty('dna');
      expect(context.analysis).toContain('Análise volumétrica não disponível');
    });

    it('deve funcionar com DNA nulo', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, null);

      expect(context).toHaveProperty('briefing');
      expect(context).toHaveProperty('terrain');
      expect(context).toHaveProperty('analysis');
      expect(context.dna).toContain('DNA arquitetônico não definido');
    });
  });

  describe('Validação de Prompts de Cortes', () => {
    it('prompt de corte deve conter dados reais do projeto', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);
      
      // Simular construção de prompt de corte transversal
      const prompt = `
ARCHITECTURAL TRANSVERSAL SECTION - STRIP MALL

${context.briefing}

${context.terrain}

${context.analysis}

${context.dna}

CRITICAL REQUIREMENTS (MUST MATCH):
${context.criticalRequirements}

Technical drawing showing:
- Cross-section view cutting through the building width
- All 12 stores visible in section
- Anchor store (800m²) clearly identifiable
- Circulation corridor
- Structural details and ceiling heights
- Parking area in front
- Landscaping elements
      `.trim();

      // Validar que o prompt contém dados críticos
      expect(prompt).toContain('12 lojas');
      expect(prompt).toContain('800 m²');
      expect(prompt).toContain('3.500 m²');
      expect(prompt).toContain('80m × 62.5m');
      expect(prompt).toContain('Edifício linear horizontal');
      expect(prompt).toContain('Contemporâneo comercial');
      expect(prompt).toContain('EXATAMENTE 12 lojas');
    });

    it('prompt de corte longitudinal deve conter dados reais', () => {
      const context = buildProjectContextFromData(mockProject, mockAnalysis, mockDNA);
      
      const prompt = `
ARCHITECTURAL LONGITUDINAL SECTION - STRIP MALL

${context.briefing}

${context.terrain}

${context.analysis}

${context.dna}

CRITICAL REQUIREMENTS (MUST MATCH):
${context.criticalRequirements}

Technical drawing showing:
- Longitudinal section view along building length (62.5m)
- Sequence of stores from anchor to satellites
- Roof structure and drainage
- Floor levels and foundation
- Circulation flow
      `.trim();

      expect(prompt).toContain('12 lojas');
      expect(prompt).toContain('62.5m');
      expect(prompt).toContain('800 m²');
      expect(prompt).toContain('EXATAMENTE 12 lojas');
    });
  });
});
