import { describe, it, expect } from 'vitest';
import { DNA_PRESETS, getPresetById, getPresetsByCategory, applyPresetToDNA } from '../services/dnaPresets';
import { ProjectDNA } from '../services/projectDNAService';

const THUMBNAIL_PATTERN = /^(\/preset-thumbnails\/|https:\/\/).+\.(png|jpg|jpeg|webp)$/i;

describe('DNA Presets', () => {
  it('should have at least 8 presets defined', () => {
    expect(DNA_PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have all required presets', () => {
    const requiredPresets = [
      'moderno-minimalista',
      'tropical-brasileiro',
      'industrial-urbano',
      'contemporaneo-sofisticado',
      'sustentavel-bioclimatico',
      'comercial-classico',
      'tech-futurista',
      'rustico-acolhedor',
    ];

    requiredPresets.forEach((presetId) => {
      const preset = getPresetById(presetId);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(presetId);
    });
  });

  it('should have valid structure for each preset', () => {
    DNA_PRESETS.forEach((preset) => {
      // Validar estrutura básica
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.category).toBeDefined();
      expect(preset.thumbnail).toBeDefined();
      expect(preset.thumbnail).toMatch(THUMBNAIL_PATTERN);

      // Validar DNA
      expect(preset.dna.style).toBeDefined();
      expect(Array.isArray(preset.dna.features)).toBe(true);
      expect(preset.dna.features.length).toBeGreaterThan(0);
      expect(preset.dna.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(preset.dna.accentColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(Array.isArray(preset.dna.materials)).toBe(true);
      expect(preset.dna.materials.length).toBeGreaterThan(0);
      expect(preset.dna.landscaping).toBeDefined();
      expect(preset.dna.layout).toBeDefined();
      expect(preset.dna.context).toBeDefined();
    });
  });

  it('should filter presets by category', () => {
    const modernoPresets = getPresetsByCategory('moderno');
    expect(modernoPresets.length).toBeGreaterThan(0);
    modernoPresets.forEach((preset) => {
      expect(preset.category).toBe('moderno');
    });

    const tropicalPresets = getPresetsByCategory('tropical');
    expect(tropicalPresets.length).toBeGreaterThan(0);
    tropicalPresets.forEach((preset) => {
      expect(preset.category).toBe('tropical');
    });
  });

  it('should apply preset to DNA maintaining volumetry', () => {
    const currentDNA: ProjectDNA = {
      buildingShape: 'Forma em L com pátio central',
      floors: 2,
      roofType: 'Laje plana impermeabilizada',
      style: 'Antigo estilo',
      features: ['Característica antiga'],
      primaryColor: '#000000',
      accentColor: '#FFFFFF',
      materials: ['Material antigo'],
      landscaping: 'Paisagismo antigo',
      layout: 'Layout antigo',
      context: 'Contexto antigo',
    };

    const preset = getPresetById('moderno-minimalista');
    expect(preset).toBeDefined();

    const newDNA = applyPresetToDNA(currentDNA, preset!);

    // Volumetria deve ser mantida
    expect(newDNA.buildingShape).toBe(currentDNA.buildingShape);
    expect(newDNA.floors).toBe(currentDNA.floors);
    expect(newDNA.roofType).toBe(currentDNA.roofType);

    // Estilo deve ser aplicado do preset
    expect(newDNA.style).toBe(preset!.dna.style);
    expect(newDNA.primaryColor).toBe(preset!.dna.primaryColor);
    expect(newDNA.accentColor).toBe(preset!.dna.accentColor);
    expect(newDNA.features).toEqual(preset!.dna.features);
    expect(newDNA.materials).toEqual(preset!.dna.materials);
  });

  it('should have unique preset IDs', () => {
    const ids = DNA_PRESETS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid category values', () => {
    const validCategories = ['moderno', 'tropical', 'industrial', 'classico', 'sustentavel'];
    DNA_PRESETS.forEach((preset) => {
      expect(validCategories).toContain(preset.category);
    });
  });

  it('should have descriptive names and descriptions', () => {
    DNA_PRESETS.forEach((preset) => {
      expect(preset.name.length).toBeGreaterThan(5);
      expect(preset.description.length).toBeGreaterThan(20);
    });
  });

  it('should have thumbnail images for all presets', () => {
    DNA_PRESETS.forEach((preset) => {
      expect(preset.thumbnail).toBeDefined();
      expect(preset.thumbnail).toMatch(THUMBNAIL_PATTERN);
      // Validar que thumbnail tem extensão de imagem
      expect(preset.thumbnail).toMatch(/\.(png|jpg|jpeg|webp)$/);
    });
  });
});
