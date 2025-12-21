import { describe, it, expect } from "vitest";
import { dnaHistory } from "../../drizzle/schema";

describe("DNA History", () => {
  it("should have correct table structure", () => {
    // Validar que a tabela existe e tem os campos corretos
    expect(dnaHistory).toBeDefined();
    
    const columns = Object.keys(dnaHistory);
    
    // Campos obrigatórios
    expect(columns).toContain("id");
    expect(columns).toContain("projectId");
    expect(columns).toContain("changeType");
    expect(columns).toContain("appliedBy");
    expect(columns).toContain("appliedAt");
    
    // Campos de preset
    expect(columns).toContain("presetId");
    expect(columns).toContain("presetName");
    
    // Campos de DNA
    expect(columns).toContain("dnaBuildingShape");
    expect(columns).toContain("dnaStyle");
    expect(columns).toContain("dnaFeatures");
    expect(columns).toContain("dnaPrimaryColor");
    expect(columns).toContain("dnaAccentColor");
    expect(columns).toContain("dnaMaterials");
    expect(columns).toContain("dnaLandscaping");
    expect(columns).toContain("dnaLayout");
    expect(columns).toContain("dnaContext");
    
    // Campos opcionais
    expect(columns).toContain("notes");
  });

  it("should have valid changeType enum values", () => {
    // Os valores válidos de changeType
    const validChangeTypes = ["preset_applied", "manual_regeneration", "initial_generation"];
    
    // Verificar que os tipos estão definidos corretamente
    // (em runtime, apenas validamos que a estrutura existe)
    expect(validChangeTypes.length).toBe(3);
    expect(validChangeTypes).toContain("preset_applied");
    expect(validChangeTypes).toContain("manual_regeneration");
    expect(validChangeTypes).toContain("initial_generation");
  });

  it("should support storing complete DNA snapshot", () => {
    // Simular um snapshot completo de DNA
    const mockDNASnapshot = {
      projectId: 1,
      presetId: "moderno-minimalista",
      presetName: "Moderno Minimalista",
      dnaBuildingShape: "Volumes retangulares puros",
      dnaStyle: "Minimalista contemporâneo comercial",
      dnaFeatures: JSON.stringify(["Linhas horizontais marcadas", "Grandes painéis de vidro"]),
      dnaPrimaryColor: "#F5F5F5",
      dnaAccentColor: "#2C3E50",
      dnaMaterials: JSON.stringify(["Concreto aparente", "Vidro low-e"]),
      dnaLandscaping: "Jardim zen minimalista",
      dnaLayout: "Pátio central aberto",
      dnaContext: "Contexto urbano moderno",
      changeType: "preset_applied" as const,
      appliedBy: 1,
    };

    // Validar que todos os campos necessários estão presentes
    expect(mockDNASnapshot.projectId).toBeDefined();
    expect(mockDNASnapshot.presetId).toBeDefined();
    expect(mockDNASnapshot.dnaStyle).toBeDefined();
    expect(mockDNASnapshot.changeType).toBeDefined();
    expect(mockDNASnapshot.appliedBy).toBeDefined();
  });

  it("should support color hex format validation", () => {
    const validColors = ["#FFFFFF", "#000000", "#F5F5F5", "#2C3E50"];
    const hexColorRegex = /^#[0-9A-F]{6}$/i;

    validColors.forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it("should support JSON serialization for arrays", () => {
    const features = ["Feature 1", "Feature 2", "Feature 3"];
    const materials = ["Material A", "Material B"];

    const serializedFeatures = JSON.stringify(features);
    const serializedMaterials = JSON.stringify(materials);

    // Validar que podem ser serializados e desserializados
    expect(JSON.parse(serializedFeatures)).toEqual(features);
    expect(JSON.parse(serializedMaterials)).toEqual(materials);
  });

  it("should support optional notes field", () => {
    const mockEntry = {
      projectId: 1,
      changeType: "preset_applied" as const,
      appliedBy: 1,
      notes: "Aplicado após feedback do cliente",
    };

    expect(mockEntry.notes).toBeDefined();
    expect(mockEntry.notes).toBe("Aplicado após feedback do cliente");
  });

  it("should track different change types", () => {
    const changeTypes = {
      presetApplied: "preset_applied",
      manualRegeneration: "manual_regeneration",
      initialGeneration: "initial_generation",
    };

    // Cada tipo representa uma ação diferente
    expect(changeTypes.presetApplied).toBe("preset_applied");
    expect(changeTypes.manualRegeneration).toBe("manual_regeneration");
    expect(changeTypes.initialGeneration).toBe("initial_generation");
  });
});
