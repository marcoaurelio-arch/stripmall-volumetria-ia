import { describe, it, expect } from "vitest";
import { generateProjectExcel } from "../excelService";

describe("Excel Export Service", () => {
  it("should generate a valid Excel buffer with project data", async () => {
    const mockProject = {
      id: 1,
      name: "Projeto Teste",
      description: "Descrição do projeto teste",
      area: 5000,
      width: 50,
      length: 100,
      taxaOcupacao: 70,
      coeficienteAproveitamento: 200,
      recuoFrontal: 5,
      recuoLateral: 3,
      recuoFundos: 3,
      address: "Rua Teste, 123",
      city: "São Paulo",
      state: "SP",
      status: "analyzed",
    };

    const mockAnalysis = {
      areaMaximaConstruida: 3500,
      areaOcupada: 3000,
      numeroLojas: 15,
      vagasEstacionamento: 80,
      volumetriaWidth: 45,
      volumetriaLength: 70,
      volumetriaHeight: 8,
      layoutDescription: "Layout em L com estacionamento frontal",
      aiSuggestions: "Considerar praça de alimentação",
    };

    const mockFinancial = {
      custoTerreno: 5000000,
      custoConstrucao: 7000000,
      custoTotal: 12000000,
      valorVenda: 15600000,
      valorAluguel: 150000,
      roi: 15.5,
      tir: 18.2,
      payback: 48,
      vpl: 3500000,
    };

    const buffer = await generateProjectExcel(mockProject, mockAnalysis, mockFinancial);

    // Verificar que o buffer foi gerado
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Verificar assinatura do arquivo Excel (XLSX é um ZIP, começa com PK)
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
  });

  it("should generate Excel without analysis data", async () => {
    const mockProject = {
      id: 2,
      name: "Projeto Sem Análise",
      area: 3000,
    };

    const buffer = await generateProjectExcel(mockProject, null, null);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should generate Excel with partial financial data", async () => {
    const mockProject = {
      id: 3,
      name: "Projeto Parcial",
      area: 4000,
    };

    const mockAnalysis = {
      areaMaximaConstruida: 2800,
      numeroLojas: 10,
    };

    const buffer = await generateProjectExcel(mockProject, mockAnalysis, null);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
