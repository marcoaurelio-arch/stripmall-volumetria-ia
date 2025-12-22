import { describe, it, expect } from "vitest";
import { validateDNAConsistency, formatValidationReport } from "../services/dnaConsistencyValidator";
import { ProjectDNA } from "../services/projectDNAService";

describe("DNA Consistency Validator", () => {
  it("should validate DNA with all required specifications", () => {
    const validDNA: ProjectDNA = {
      buildingShape: "Edifício retangular horizontal",
      floors: 1,
      roofType: "Laje plana impermeabilizada",
      style: "Strip Mall Comercial Brasileiro Contemporâneo",
      features: [
        "OBRIGATÓRIO: Calçada coberta contínua de 3-4m",
        "OBRIGATÓRIO: Vitrines em vidro temperado 70-80%",
        "OBRIGATÓRIO: Faixa para letreiros h=0.8-1.2m",
        "OBRIGATÓRIO: Pilares a cada 6-8m",
        "OBRIGATÓRIO: Platibanda 0.8-1.2m",
      ],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: [
        "ESTRUTURA: Concreto armado pintado em #F5F5F5",
        "FACHADA: Vidro temperado 8mm + alumínio #2C3E50",
        "PILARES: Concreto #2C3E50 a cada 6-8m",
      ],
      landscaping: "OBRIGATÓRIO: Árvores nativas (Ipê, Resedá) 6-8m no estacionamento",
      layout: "CONFIGURAÇÃO OBRIGATÓRIA: Calçada coberta 3-4m ao longo de 100% das lojas",
      context: "Clima tropical brasileiro com sol intenso - EXIGE sombreamento",
    };

    const result = validateDNAConsistency(validDNA);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect invalid hex colors", () => {
    const invalidDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["Feature 1"],
      primaryColor: "branco", // Inválido
      accentColor: "#GGG", // Inválido
      materials: ["Material 1", "Material 2", "Material 3"],
      landscaping: "Árvores",
      layout: "Linear",
      context: "Urbano",
    };

    const result = validateDNAConsistency(invalidDNA);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("Cor principal inválida"))).toBe(true);
    expect(result.errors.some((e) => e.includes("Cor de destaque inválida"))).toBe(true);
  });

  it("should warn about generic colors", () => {
    const genericColorDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      primaryColor: "#FFFFFF", // Branco puro - muito genérico
      accentColor: "#000000", // Preto puro - muito genérico
      materials: [
        "Material específico com detalhes técnicos",
        "Outro material com especificação",
        "Terceiro material detalhado",
      ],
      landscaping: "Árvores Ipê e Resedá",
      layout: "Linear com 3-4m de calçada",
      context: "Clima tropical brasileiro",
    };

    const result = validateDNAConsistency(genericColorDNA);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("muito genérica"))).toBe(true);
  });

  it("should require minimum 3 materials", () => {
    const insufficientMaterialsDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature"],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: ["Material 1", "Material 2"], // Apenas 2
      landscaping: "Árvores",
      layout: "Linear",
      context: "Urbano",
    };

    const result = validateDNAConsistency(insufficientMaterialsDNA);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Materiais insuficientes"))).toBe(true);
  });

  it("should warn about vague materials", () => {
    const vagueMaterialsDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: ["Concreto", "Vidro", "Alumínio"], // Muito vagos
      landscaping: "Árvores Ipê",
      layout: "Linear 3m",
      context: "Clima tropical",
    };

    const result = validateDNAConsistency(vagueMaterialsDNA);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("muito vago"))).toBe(true);
  });

  it("should warn about missing mandatory features", () => {
    const noMandatoryFeaturesDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"], // Sem OBRIGATÓRIO
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: [
        "Material detalhado 1",
        "Material detalhado 2",
        "Material detalhado 3",
      ],
      landscaping: "Árvores Ipê",
      layout: "Linear 3m",
      context: "Clima tropical",
    };

    const result = validateDNAConsistency(noMandatoryFeaturesDNA);

    expect(result.warnings.some((w) => w.includes("OBRIGATÓRIA"))).toBe(true);
  });

  it("should warn about generic landscaping", () => {
    const genericLandscapingDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: [
        "Material detalhado 1",
        "Material detalhado 2",
        "Material detalhado 3",
      ],
      landscaping: "Árvores e plantas", // Muito genérico
      layout: "Linear 3m",
      context: "Clima tropical",
    };

    const result = validateDNAConsistency(genericLandscapingDNA);

    expect(result.warnings.some((w) => w.includes("Paisagismo muito genérico"))).toBe(true);
  });

  it("should warn about layout without dimensions", () => {
    const noDimensionsLayoutDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: [
        "Material detalhado 1",
        "Material detalhado 2",
        "Material detalhado 3",
      ],
      landscaping: "OBRIGATÓRIO: Árvores Ipê",
      layout: "Linear com calçada", // Sem dimensões
      context: "Clima tropical brasileiro",
    };

    const result = validateDNAConsistency(noDimensionsLayoutDNA);

    expect(result.warnings.some((w) => w.includes("sem dimensões"))).toBe(true);
  });

  it("should warn about context without climate info", () => {
    const noClimateContextDNA: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["OBRIGATÓRIO: Feature", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      primaryColor: "#F5F5F5",
      accentColor: "#2C3E50",
      materials: [
        "Material detalhado 1",
        "Material detalhado 2",
        "Material detalhado 3",
      ],
      landscaping: "OBRIGATÓRIO: Árvores Ipê",
      layout: "OBRIGATÓRIO: Linear 3-4m",
      context: "Bairro urbano consolidado", // Sem clima
    };

    const result = validateDNAConsistency(noClimateContextDNA);

    expect(result.warnings.some((w) => w.includes("sem referência climática"))).toBe(true);
  });

  it("should format validation report correctly", () => {
    const dna: ProjectDNA = {
      buildingShape: "Retangular",
      floors: 1,
      roofType: "Laje plana",
      style: "Moderno",
      features: ["Feature 1"],
      primaryColor: "invalid", // Erro
      accentColor: "#2C3E50",
      materials: ["Mat1", "Mat2"], // Erro (menos de 3)
      landscaping: "Plantas", // Aviso
      layout: "Linear",
      context: "Urbano",
    };

    const result = validateDNAConsistency(dna);
    const report = formatValidationReport(result);

    expect(report).toContain("VALIDAÇÃO DE CONSISTÊNCIA DO DNA");
    expect(report).toContain("❌ DNA INVÁLIDO");
    expect(report).toContain("Cor principal inválida");
    expect(report).toContain("Materiais insuficientes");
  });
});
