import { describe, it, expect } from 'vitest';
import { analyzeShadow } from '../services/shadowAnalysisService';
import { calculateConstructionCost, getAvailableStates, getBuildingTypes } from '../services/cubCostService';

describe('Animação de Trajetória Solar', () => {
  it('deve calcular posição do sol corretamente', () => {
    const result = analyzeShadow({
      buildingLayout: {
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 1.0,
      },
      buildingHeight: 8,
      terrain: {
        width: 150,
        length: 100,
        area: 15000,
      },
      location: {
        latitude: -23.55,
        longitude: -46.63,
      },
      datetime: new Date('2024-06-21T12:00:00Z'),
    });

    expect(result).toHaveProperty('solarPosition');
    expect(result.solarPosition).toHaveProperty('azimuth');
    expect(result.solarPosition).toHaveProperty('elevation');
    expect(result.solarPosition.azimuth).toBeGreaterThanOrEqual(0);
    expect(result.solarPosition.azimuth).toBeLessThan(360);
  });

  it('deve analisar sombreamento corretamente', () => {
    const result = analyzeShadow({
      buildingLayout: {
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 1.0,
      },
      buildingHeight: 8,
      terrain: {
        width: 150,
        length: 100,
        area: 15000,
      },
      location: {
        latitude: -23.55,
        longitude: -46.63,
      },
      datetime: new Date('2024-12-21T12:00:00Z'),
    });

    expect(result).toHaveProperty('shadow');
    expect(result.shadow).toHaveProperty('polygonPoints');
    expect(result.shadow).toHaveProperty('length');
    expect(result.shadow).toHaveProperty('direction');
    expect(result.shadow.polygonPoints).toBeInstanceOf(Array);
  });

  it('deve calcular horas de sol corretamente', () => {
    const result = analyzeShadow({
      buildingLayout: {
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 1.0,
      },
      buildingHeight: 8,
      terrain: {
        width: 150,
        length: 100,
        area: 15000,
      },
      location: {
        latitude: -23.55,
        longitude: -46.63,
      },
      datetime: new Date('2024-12-21T12:00:00Z'),
    });

    expect(result).toHaveProperty('sunlightHours');
    expect(result.sunlightHours).toBeGreaterThan(0);
    expect(result.sunlightHours).toBeLessThanOrEqual(24);
  });
});

describe('Integração com Custos CUB', () => {
  it('deve calcular custo de construção corretamente', () => {
    const result = calculateConstructionCost({
      state: 'SP',
      buildingType: 'shopping_center',
      totalArea: 5000,
      floors: 1,
      qualityFactor: 1.0,
      complexityFactor: 1.0,
    });

    expect(result).toHaveProperty('cubValue');
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('costPerSqm');
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.costPerSqm).toBeGreaterThan(0);
  });

  it('deve aplicar fatores de ajuste corretamente', () => {
    const base = calculateConstructionCost({
      state: 'SP',
      buildingType: 'shopping_center',
      totalArea: 5000,
      floors: 1,
      qualityFactor: 1.0,
      complexityFactor: 1.0,
    });

    const highQuality = calculateConstructionCost({
      state: 'SP',
      buildingType: 'shopping_center',
      totalArea: 5000,
      floors: 1,
      qualityFactor: 1.2,
      complexityFactor: 1.0,
    });

    expect(highQuality.totalCost).toBeGreaterThan(base.totalCost);
  });

  it('deve calcular custos para diferentes estados', () => {
    const sp = calculateConstructionCost({
      state: 'SP',
      buildingType: 'comercial_padrao',
      totalArea: 1000,
      floors: 1,
    });

    const rs = calculateConstructionCost({
      state: 'RS',
      buildingType: 'comercial_padrao',
      totalArea: 1000,
      floors: 1,
    });

    expect(sp.cubValue).not.toBe(rs.cubValue);
    expect(sp.totalCost).not.toBe(rs.totalCost);
  });

  it('deve retornar lista de estados disponíveis', () => {
    const states = getAvailableStates();
    expect(states).toBeInstanceOf(Array);
    expect(states.length).toBeGreaterThan(0);
    expect(states).toContain('SP');
    expect(states).toContain('RJ');
    expect(states).toContain('RS');
  });

  it('deve retornar tipos de construção disponíveis', () => {
    const types = getBuildingTypes();
    expect(types).toBeInstanceOf(Array);
    expect(types.length).toBe(4);
    expect(types).toContain('comercial_padrao');
    expect(types).toContain('shopping_center');
  });

  it('deve incluir custos indiretos no cálculo', () => {
    const result = calculateConstructionCost({
      state: 'SP',
      buildingType: 'shopping_center',
      totalArea: 5000,
      floors: 1,
    });

    expect(result).toHaveProperty('projectCost');
    expect(result).toHaveProperty('approvalCost');
    expect(result).toHaveProperty('managementCost');
    expect(result).toHaveProperty('contingency');
    
    expect(result.projectCost).toBeGreaterThan(0);
    expect(result.approvalCost).toBeGreaterThan(0);
    expect(result.managementCost).toBeGreaterThan(0);
    expect(result.contingency).toBeGreaterThan(0);

    const totalIndirect = 
      result.projectCost +
      result.approvalCost +
      result.managementCost +
      result.contingency;

    expect(result.indirectCost).toBeCloseTo(totalIndirect, 2);
  });

  it('deve ajustar custo por número de pavimentos', () => {
    const oneFloor = calculateConstructionCost({
      state: 'SP',
      buildingType: 'comercial_padrao',
      totalArea: 2000,
      floors: 1,
    });

    const twoFloors = calculateConstructionCost({
      state: 'SP',
      buildingType: 'comercial_padrao',
      totalArea: 2000,
      floors: 2,
    });

    expect(twoFloors.floorsAdjustment).toBeGreaterThan(oneFloor.floorsAdjustment);
    expect(twoFloors.totalCost).toBeGreaterThan(oneFloor.totalCost);
  });
});
