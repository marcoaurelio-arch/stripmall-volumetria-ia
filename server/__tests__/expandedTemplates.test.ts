import { describe, it, expect } from 'vitest';
import {
  LAYOUT_TEMPLATES,
  getTemplatesByCategory,
  getTemplateById,
  recommendTemplates,
  applyTemplate,
} from '../services/layoutTemplatesService';

describe('Templates Expandidos', () => {
  it('deve ter 21 templates no total', () => {
    expect(LAYOUT_TEMPLATES).toHaveLength(21);
  });

  it('deve ter todas as categorias implementadas', () => {
    const categories = [...new Set(LAYOUT_TEMPLATES.map(t => t.category))];
    expect(categories).toContain('retangular');
    expect(categories).toContain('L');
    expect(categories).toContain('esquina');
    expect(categories).toContain('irregular');
    expect(categories).toContain('estreito');
    expect(categories).toContain('triangular');
    expect(categories).toContain('patio');
  });

  it('deve ter templates de densidade (compacto e espaçoso)', () => {
    const compacto = getTemplateById('densidade-compacta');
    const espacoso = getTemplateById('densidade-espacosa');

    expect(compacto).toBeDefined();
    expect(espacoso).toBeDefined();
    expect(compacto?.layout.scale).toBe(95);
    expect(espacoso?.layout.scale).toBe(60);
  });

  it('deve ter 3 templates para terrenos estreitos', () => {
    const estreitos = getTemplatesByCategory('estreito');
    expect(estreitos).toHaveLength(3);
    expect(estreitos.map(t => t.id)).toContain('estreito-linear-frontal');
    expect(estreitos.map(t => t.id)).toContain('estreito-perpendicular');
    expect(estreitos.map(t => t.id)).toContain('estreito-modular');
  });

  it('deve ter 2 templates para terrenos triangulares', () => {
    const triangulares = getTemplatesByCategory('triangular');
    expect(triangulares).toHaveLength(2);
    expect(triangulares.map(t => t.id)).toContain('triangular-canto-reto');
    expect(triangulares.map(t => t.id)).toContain('triangular-adaptado');
  });

  it('deve ter 3 templates com pátio central', () => {
    const patios = getTemplatesByCategory('patio');
    expect(patios).toHaveLength(3);
    expect(patios.map(t => t.id)).toContain('patio-central-quadrado');
    expect(patios.map(t => t.id)).toContain('patio-em-L');
    expect(patios.map(t => t.id)).toContain('patio-em-U');
  });

  it('deve ter template de esquina chanfrada', () => {
    const chanfrada = getTemplateById('esquina-chanfrada');
    expect(chanfrada).toBeDefined();
    expect(chanfrada?.category).toBe('esquina');
    expect(chanfrada?.name).toBe('Esquina Chanfrada');
  });

  it('deve ter template de L duplo espelhado', () => {
    const lDuplo = getTemplateById('L-duplo');
    expect(lDuplo).toBeDefined();
    expect(lDuplo?.category).toBe('L');
    expect(lDuplo?.name).toBe('L Duplo Espelhado');
  });

  it('deve recomendar templates estreitos para terrenos com proporção > 3:1', () => {
    const recomendados = recommendTemplates({
      width: 20,
      length: 100,
      area: 2000,
      isCorner: false,
      isIrregular: false,
      hasLShape: false,
    });

    const temEstreito = recomendados.some(t => t.category === 'estreito');
    expect(temEstreito).toBe(true);
  });

  it('deve recomendar templates com pátio para terrenos grandes (> 10.000m²)', () => {
    const recomendados = recommendTemplates({
      width: 150,
      length: 100,
      area: 15000,
      isCorner: false,
      isIrregular: false,
      hasLShape: false,
    });

    const temPatio = recomendados.some(t => t.category === 'patio');
    expect(temPatio).toBe(true);
  });

  it('deve aplicar template estreito linear frontal corretamente', () => {
    const layout = applyTemplate('estreito-linear-frontal', {
      width: 20,
      length: 100,
      area: 2000,
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 5,
      },
    });

    expect(layout).not.toBeNull();
    expect(layout?.offsetY).toBe(-15);
    expect(layout?.rotation).toBe(0);
    expect(layout?.scale).toBeLessThanOrEqual(85);
  });

  it('deve aplicar template perpendicular com rotação de 90°', () => {
    const layout = applyTemplate('estreito-perpendicular', {
      width: 15,
      length: 80,
      area: 1200,
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 5,
      },
    });

    expect(layout).not.toBeNull();
    expect(layout?.rotation).toBe(90);
  });

  it('deve aplicar template triangular com escala reduzida', () => {
    const layout = applyTemplate('triangular-canto-reto', {
      width: 50,
      length: 50,
      area: 1250, // Área triangular
      setbacks: {
        frontal: 5,
        lateral: 5,
        fundos: 5,
      },
    });

    expect(layout).not.toBeNull();
    expect(layout?.scale).toBeLessThanOrEqual(65);
  });

  it('deve aplicar template de pátio central com escala apropriada', () => {
    const layout = applyTemplate('patio-central-quadrado', {
      width: 100,
      length: 100,
      area: 10000,
      setbacks: {
        frontal: 5,
        lateral: 5,
        fundos: 5,
      },
    });

    expect(layout).not.toBeNull();
    expect(layout?.offsetX).toBe(0);
    expect(layout?.offsetY).toBe(0);
    expect(layout?.scale).toBeLessThanOrEqual(80);
  });

  it('deve ajustar escala baseado em recuos disponíveis', () => {
    // Recuos grandes devem reduzir escala
    const layoutRecuosGrandes = applyTemplate('retangular-centralizado', {
      width: 50,
      length: 50,
      area: 2500,
      setbacks: {
        frontal: 10,
        lateral: 10,
        fundos: 10,
      },
    });

    // Recuos pequenos permitem escala maior
    const layoutRecuosPequenos = applyTemplate('retangular-centralizado', {
      width: 50,
      length: 50,
      area: 2500,
      setbacks: {
        frontal: 3,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(layoutRecuosGrandes).not.toBeNull();
    expect(layoutRecuosPequenos).not.toBeNull();
    expect(layoutRecuosGrandes!.scale).toBeLessThan(layoutRecuosPequenos!.scale);
  });

  it('todos os templates devem ter descrições e recomendações', () => {
    LAYOUT_TEMPLATES.forEach(template => {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.recommendedFor).toBeInstanceOf(Array);
      expect(template.recommendedFor.length).toBeGreaterThan(0);
      expect(template.pros).toBeInstanceOf(Array);
      expect(template.pros.length).toBeGreaterThan(0);
      expect(template.cons).toBeInstanceOf(Array);
      expect(template.cons.length).toBeGreaterThan(0);
    });
  });

  it('todos os templates devem ter IDs únicos', () => {
    const ids = LAYOUT_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('todos os templates devem ter layout válido', () => {
    LAYOUT_TEMPLATES.forEach(template => {
      expect(template.layout).toBeDefined();
      expect(template.layout.offsetX).toBeGreaterThanOrEqual(-50);
      expect(template.layout.offsetX).toBeLessThanOrEqual(50);
      expect(template.layout.offsetY).toBeGreaterThanOrEqual(-50);
      expect(template.layout.offsetY).toBeLessThanOrEqual(50);
      expect(template.layout.rotation).toBeGreaterThanOrEqual(0);
      expect(template.layout.rotation).toBeLessThan(360);
      expect(template.layout.scale).toBeGreaterThan(0);
      expect(template.layout.scale).toBeLessThanOrEqual(100);
    });
  });
});
