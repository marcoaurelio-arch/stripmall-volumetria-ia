import { describe, it, expect } from 'vitest';
import { optimizeLayout } from '../services/layoutOptimizationService';
import { generateLayoutComparisonMarkdown } from '../services/layoutPdfExportService';

describe('Layout Optimization Service', () => {
  it('should optimize layout for maximum occupancy', () => {
    const result = optimizeLayout({
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
      preferences: {
        prioritizeOccupancy: true,
      },
    });

    expect(result).toBeDefined();
    expect(result.scale).toBeGreaterThan(0);
    expect(result.scale).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasoning).toBeTruthy();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.occupancyRate).toBeGreaterThan(0);
  });

  it('should respect setbacks in optimized layout', () => {
    const result = optimizeLayout({
      terrain: {
        width: 30,
        length: 60,
        area: 1800,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
      preferences: {
        prioritizeOccupancy: true,
      },
    });

    // O layout otimizado deve considerar os recuos
    expect(result.scale).toBeLessThan(100); // Não pode ocupar 100% devido aos recuos
    expect(result.metrics.occupancyRate).toBeLessThan(100);
  });

  it('should prioritize solar orientation when requested', () => {
    const result = optimizeLayout({
      terrain: {
        width: 40,
        length: 80,
        area: 3200,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
      preferences: {
        prioritizeSolar: true,
      },
    });

    expect(result.rotation).toBe(0); // Orientação Norte (padrão para solar)
    expect(result.metrics.solarOrientation).toBe('Norte');
  });

  it('should calculate metrics correctly', () => {
    const result = optimizeLayout({
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(result.metrics.footprintArea).toBeGreaterThan(0);
    expect(result.metrics.wastedArea).toBeGreaterThan(0);
    expect(result.metrics.footprintArea + result.metrics.wastedArea).toBeCloseTo(5000, 1);
  });

  it('should generate higher scores for better layouts', () => {
    const goodLayout = optimizeLayout({
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 3,
        lateral: 2,
        fundos: 2,
      },
    });

    const restrictedLayout = optimizeLayout({
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 10,
        lateral: 8,
        fundos: 8,
      },
    });

    // Layout com menos recuos deve ter score melhor
    expect(goodLayout.score).toBeGreaterThan(restrictedLayout.score);
  });
});

describe('Layout PDF Export Service', () => {
  it('should generate markdown for single layout', () => {
    const markdown = generateLayoutComparisonMarkdown({
      projectName: 'Teste Strip Mall',
      layouts: [
        {
          id: 1,
          name: 'Layout Padrão',
          description: 'Layout centralizado',
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 80,
          isValid: 1,
        },
      ],
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(markdown).toContain('# Comparação de Layouts');
    expect(markdown).toContain('Teste Strip Mall');
    expect(markdown).toContain('Layout Padrão');
    expect(markdown).toContain('5000 m²');
    expect(markdown).toContain('Recuo Frontal');
  });

  it('should generate markdown for multiple layouts', () => {
    const markdown = generateLayoutComparisonMarkdown({
      projectName: 'Projeto Teste',
      layouts: [
        {
          id: 1,
          name: 'Layout A',
          description: null,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 80,
          isValid: 1,
        },
        {
          id: 2,
          name: 'Layout B',
          description: 'Aproveitamento máximo',
          offsetX: 5,
          offsetY: -5,
          rotation: 0,
          scale: 90,
          isValid: 1,
        },
      ],
      terrain: {
        width: 40,
        length: 80,
        area: 3200,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(markdown).toContain('Layout A');
    expect(markdown).toContain('Layout B');
    expect(markdown).toContain('Aproveitamento máximo');
    expect(markdown).toContain('## Tabela Comparativa');
    expect(markdown).toContain('## Detalhes dos Layouts');
  });

  it('should include recommendation for best layout', () => {
    const markdown = generateLayoutComparisonMarkdown({
      projectName: 'Projeto Teste',
      layouts: [
        {
          id: 1,
          name: 'Layout Ruim',
          description: null,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 50,
          isValid: 1,
        },
        {
          id: 2,
          name: 'Layout Ótimo',
          description: null,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 85,
          isValid: 1,
        },
      ],
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(markdown).toContain('## 🎯 Recomendação');
    expect(markdown).toContain('Layout Ótimo');
    expect(markdown).toContain('recomendado');
  });

  it('should show validation status correctly', () => {
    const markdown = generateLayoutComparisonMarkdown({
      projectName: 'Projeto Teste',
      layouts: [
        {
          id: 1,
          name: 'Layout Válido',
          description: null,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 70,
          isValid: 1,
        },
      ],
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(markdown).toContain('✅');
    expect(markdown).toContain('Validação de Recuos');
  });

  it('should include all required sections', () => {
    const markdown = generateLayoutComparisonMarkdown({
      projectName: 'Projeto Completo',
      layouts: [
        {
          id: 1,
          name: 'Layout Teste',
          description: 'Descrição teste',
          offsetX: 10,
          offsetY: -10,
          rotation: 45,
          scale: 75,
          isValid: 1,
        },
      ],
      terrain: {
        width: 60,
        length: 120,
        area: 7200,
      },
      setbacks: {
        frontal: 6,
        lateral: 4,
        fundos: 4,
      },
    });

    expect(markdown).toContain('## Informações do Terreno');
    expect(markdown).toContain('## Tabela Comparativa');
    expect(markdown).toContain('## Detalhes dos Layouts');
    expect(markdown).toContain('**Parâmetros:**');
    expect(markdown).toContain('**Métricas:**');
    expect(markdown).toContain('**Validação de Recuos:**');
    expect(markdown).toContain('Posição X: 10%');
    expect(markdown).toContain('Rotação: 45°');
  });
});
