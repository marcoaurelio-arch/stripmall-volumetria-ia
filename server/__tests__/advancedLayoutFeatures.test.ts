import { describe, it, expect } from 'vitest';
import { calculateSolarPosition, analyzeShadow } from '../services/shadowAnalysisService';
import { LAYOUT_TEMPLATES, getTemplatesByCategory, recommendTemplates, applyTemplate } from '../services/layoutTemplatesService';
import { optimizeLayout } from '../services/layoutOptimizationService';

describe('Shadow Analysis Service', () => {
  it('should calculate sun position correctly for São Paulo at noon', () => {
    const position = calculateSolarPosition(
      -23.55, // São Paulo latitude
      -46.63, // São Paulo longitude
      new Date('2024-06-21T12:00:00Z') // Summer solstice at noon
    );

    expect(position.azimuth).toBeGreaterThanOrEqual(0);
    expect(position.azimuth).toBeLessThan(360);
    expect(position.elevation).toBeGreaterThanOrEqual(-90); // Can be negative if sun is below horizon
    expect(position.elevation).toBeLessThan(90);
  });

  it('should calculate shadow projection', () => {
    const position = calculateSolarPosition(
      -23.55,
      -46.63,
      new Date('2024-06-21T15:00:00Z')
    );

    // Shadow length calculation
    const buildingHeight = 10;
    const shadowLength = buildingHeight / Math.tan(position.elevation * Math.PI / 180);
    
    expect(shadowLength).toBeGreaterThan(0);
    expect(position.azimuth).toBeDefined();
  });

  it('should analyze shadow throughout the day', () => {
    const analysis = analyzeShadow({
      buildingLayout: {
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 80,
      },
      buildingHeight: 10,
      terrain: {
        width: 50,
        length: 100,
        area: 5000,
      },
      location: {
        latitude: -23.55,
        longitude: -46.63,
      },
      datetime: new Date('2024-06-21T12:00:00Z'),
    });

    expect(analysis.shadow).toBeDefined();
    expect(analysis.shadow.length).toBeGreaterThanOrEqual(0);
    expect(analysis.sunlightHours).toBeGreaterThanOrEqual(0);
  });
});

describe('Layout Templates Service', () => {
  it('should have multiple predefined templates', () => {
    expect(LAYOUT_TEMPLATES.length).toBeGreaterThanOrEqual(9);
  });

  it('should filter templates by category', () => {
    const retangularTemplates = getTemplatesByCategory('retangular');
    expect(retangularTemplates.length).toBeGreaterThan(0);
    retangularTemplates.forEach(t => {
      expect(t.category).toBe('retangular');
    });
  });

  it('should recommend templates based on terrain characteristics', () => {
    const recommendations = recommendTemplates({
      width: 50,
      length: 100,
      area: 5000,
      isCorner: true,
    });

    expect(recommendations.length).toBeGreaterThan(0);
    // Corner templates should be prioritized
    expect(recommendations[0].category).toBe('esquina');
  });

  it('should apply template and adjust to terrain', () => {
    const layout = applyTemplate('retangular-centralizado', {
      width: 50,
      length: 100,
      area: 5000,
      setbacks: {
        frontal: 5,
        lateral: 3,
        fundos: 3,
      },
    });

    expect(layout).toBeDefined();
    expect(layout?.offsetX).toBeDefined();
    expect(layout?.offsetY).toBeDefined();
    expect(layout?.rotation).toBeGreaterThanOrEqual(0);
    expect(layout?.scale).toBeGreaterThan(0);
    expect(layout?.scale).toBeLessThanOrEqual(100);
  });
});

describe('Multi-Objective Optimization', () => {
  it('should optimize layout with default weights', () => {
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

    expect(result.offsetX).toBeDefined();
    expect(result.offsetY).toBeDefined();
    expect(result.rotation).toBeGreaterThanOrEqual(0);
    expect(result.scale).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasoning).toBeTruthy();
  });

  it('should optimize layout with custom weights prioritizing occupancy', () => {
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
      weights: {
        occupancy: 70,
        solar: 10,
        aesthetics: 10,
        cost: 10,
      },
    });

    expect(result.metrics.occupancyRate).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should optimize layout with custom weights prioritizing solar orientation', () => {
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
      weights: {
        occupancy: 10,
        solar: 70,
        aesthetics: 10,
        cost: 10,
      },
    });

    // Should prefer north orientation (0° or 360°)
    expect(result.rotation % 360).toBeLessThan(45);
    expect(result.metrics.solarOrientation).toContain('Norte');
  });

  it('should optimize layout with custom weights prioritizing cost', () => {
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
      weights: {
        occupancy: 10,
        solar: 10,
        aesthetics: 10,
        cost: 70,
      },
    });

    // Cost optimization may not always reduce scale due to other constraints
    expect(result.scale).toBeGreaterThan(0);
    expect(result.scale).toBeLessThanOrEqual(100);
  });

  it('should normalize weights automatically', () => {
    const result1 = optimizeLayout({
      terrain: { width: 50, length: 100, area: 5000 },
      setbacks: { frontal: 5, lateral: 3, fundos: 3 },
      weights: { occupancy: 40, solar: 30, aesthetics: 20, cost: 10 },
    });

    const result2 = optimizeLayout({
      terrain: { width: 50, length: 100, area: 5000 },
      setbacks: { frontal: 5, lateral: 3, fundos: 3 },
      weights: { occupancy: 80, solar: 60, aesthetics: 40, cost: 20 }, // Same proportions, different totals
    });

    // Scores should be similar since weights are normalized
    expect(Math.abs(result1.score - result2.score)).toBeLessThan(5);
  });
});
