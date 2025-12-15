import { describe, it, expect } from 'vitest';
import { validateSetbacks, suggestCorrection, formatViolationMessage } from '../services/setbackValidationService';
import { generateLayoutDescription } from '../services/layoutDescriptionService';

describe('Validação de Recuos', () => {
  const terrain = {
    width: 50,
    length: 100,
    area: 5000,
  };

  const setbacks = {
    frontal: 5,
    lateral: 3,
    fundos: 3,
  };

  it('deve validar layout centralizado sem violações', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 60, // Escala menor para garantir recuos
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.isValid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('deve detectar violação de recuo frontal', () => {
    const layout = {
      offsetX: 0,
      offsetY: -40, // Muito para frente
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.isValid).toBe(false);
    expect(result.violations.some(v => v.type === 'frontal')).toBe(true);
  });

  it('deve detectar violação de recuo lateral esquerdo', () => {
    const layout = {
      offsetX: -45, // Muito para esquerda
      offsetY: 0,
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.isValid).toBe(false);
    expect(result.violations.some(v => v.type === 'lateral_esquerda')).toBe(true);
  });

  it('deve detectar violação de recuo lateral direito', () => {
    const layout = {
      offsetX: 45, // Muito para direita
      offsetY: 0,
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.isValid).toBe(false);
    expect(result.violations.some(v => v.type === 'lateral_direita')).toBe(true);
  });

  it('deve detectar violação de recuo de fundos', () => {
    const layout = {
      offsetX: 0,
      offsetY: 40, // Muito para trás
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.isValid).toBe(false);
    expect(result.violations.some(v => v.type === 'fundos')).toBe(true);
  });

  it('deve calcular recuos atuais corretamente', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 60,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.actualSetbacks.frontal).toBeGreaterThan(0);
    expect(result.actualSetbacks.lateral_esquerda).toBeGreaterThan(0);
    expect(result.actualSetbacks.lateral_direita).toBeGreaterThan(0);
    expect(result.actualSetbacks.fundos).toBeGreaterThan(0);
  });

  it('deve classificar severidade das violações', () => {
    const layout = {
      offsetX: -48, // Violação grande
      offsetY: 0,
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    const violation = result.violations.find(v => v.type === 'lateral_esquerda');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBeDefined();
  });

  it('deve gerar avisos para rotações não-ortogonais', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 45, // Rotação não-ortogonal
      scale: 60,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    expect(result.warnings.some(w => w.includes('não-ortogonal'))).toBe(true);
  });

  it('deve formatar mensagem de violação corretamente', () => {
    const violation = {
      type: 'frontal' as const,
      required: 5,
      actual: 2.5,
      violation: 2.5,
      severity: 'moderate' as const,
    };

    const message = formatViolationMessage(violation);

    expect(message).toContain('Recuo Frontal');
    expect(message).toContain('5');
    expect(message).toContain('2.5');
  });

  it('deve sugerir correção para violações', () => {
    const layout = {
      offsetX: -48,
      offsetY: 0,
      rotation: 0,
      scale: 80,
    };

    const result = validateSetbacks(layout, terrain, setbacks);
    const corrected = suggestCorrection(layout, result.violations);

    // Correção deve ajustar offsetX ou scale
    expect(corrected.offsetX !== layout.offsetX || corrected.scale !== layout.scale).toBe(true);
  });

  it('deve lidar com edifícios rotacionados', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 90,
      scale: 60,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    // Com rotação de 90°, as dimensões se invertem
    expect(result.buildingFootprint).toBeDefined();
  });

  it('deve validar layout com escala máxima', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 100,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    // Escala 100% provavelmente viola recuos
    expect(result.isValid).toBe(false);
  });

  it('deve validar layout com escala mínima', () => {
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 50,
    };

    const result = validateSetbacks(layout, terrain, setbacks);

    // Escala 50% deve ser válida
    expect(result.isValid).toBe(true);
  });
});

describe('Descrição de Layout', () => {
  it('deve gerar descrição vazia para layout padrão', () => {
    
    const layout = {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 80,
    };

    const description = generateLayoutDescription(layout);
    expect(description).toBe('');
  });

  it('deve gerar descrição para layout customizado', () => {
    
    const layout = {
      offsetX: 20,
      offsetY: -10,
      rotation: 45,
      scale: 90,
    };

    const description = generateLayoutDescription(layout);
    expect(description).toContain('CUSTOM BUILDING LAYOUT');
    expect(description).toContain('20%');
    expect(description).toContain('45°');
  });
});
