import { describe, expect, it } from "vitest";
import {
  computeMassingLimits,
  formatVerificationBlock,
  MassingInputError,
  reconcileWithAI,
} from "../services/massingEngine";

// Casos dos EXEMPLO-PRATICO-*.md (os números "da IA" são os que os textos afirmam)
const boulevard = { area: 4200, width: 60, length: 70, taxaOcupacao: 65, coeficienteAproveitamento: 180, recuoFrontal: 8, recuoLateral: 5, recuoFundos: 5 };
const moradaPlaza = { area: 3500, width: 50, length: 70, taxaOcupacao: 60, coeficienteAproveitamento: 100, recuoFrontal: 5, recuoLateral: 3, recuoFundos: 3 };
const espacoSaude = { area: 6000, width: 75, length: 80, taxaOcupacao: 70, coeficienteAproveitamento: 150, recuoFrontal: 5, recuoLateral: 3, recuoFundos: 3 };

describe("computeMassingLimits", () => {
  it("envelope = lote menos recuos (Boulevard: 50 × 57 = 2.850, não 2.450)", () => {
    const l = computeMassingLimits(boulevard);
    expect(l.envelope).toEqual({ width: 50, length: 57, area: 2850 });
    expect(l.maxFootprint).toBe(2730); // TO 65% × 4.200 < envelope
    expect(l.maxGrossFloorArea).toBe(7560);
  });

  it("projeção máxima é o menor entre TO e envelope (Morada Plaza: 2.100 vs 2.728)", () => {
    const l = computeMassingLimits(moradaPlaza);
    expect(l.envelope.area).toBe(2728);
    expect(l.maxFootprint).toBe(2100);
    expect(l.maxGrossFloorArea).toBe(3500);
  });

  it("volumetria de referência respeita TO, CA e envelope", () => {
    for (const c of [boulevard, moradaPlaza, espacoSaude]) {
      const l = computeMassingLimits(c);
      expect(l.reference.footprint).toBeLessThanOrEqual(l.maxFootprint);
      expect(l.reference.footprint).toBeLessThanOrEqual(l.envelope.area);
      expect(l.reference.grossFloorArea).toBeLessThanOrEqual(l.maxGrossFloorArea);
      expect(l.reference.width).toBeLessThanOrEqual(l.envelope.width);
      expect(l.reference.length).toBeLessThanOrEqual(l.envelope.length);
      expect(l.reference.width * l.reference.length).toBeCloseTo(l.reference.footprint, 0);
    }
  });

  it("CA limita os pavimentos (Morada Plaza CA 1,0: 1 pavimento)", () => {
    const l = computeMassingLimits(moradaPlaza);
    expect(l.reference.floors).toBe(1);
    expect(l.reference.grossFloorArea).toBe(2100);
    const b = computeMassingLimits(boulevard);
    expect(b.reference.floors).toBe(2);
    expect(b.reference.grossFloorArea).toBe(5460);
  });

  it("vagas e lojas derivam da área construída, com premissa explícita do índice", () => {
    const l = computeMassingLimits(moradaPlaza);
    expect(l.parking).toEqual({ required: 84, m2PerSpace: 25 });
    expect(l.stores.min).toBe(14); // 2.100 / 150
    expect(l.stores.max).toBe(42); // 2.100 / 50
    expect(l.premises.some((p) => p.includes("Índice de vagas"))).toBe(true);
    const custom = computeMassingLimits({ ...moradaPlaza, m2PerParkingSpace: 50 });
    expect(custom.parking.required).toBe(42);
    expect(custom.premises.some((p) => p.includes("Índice de vagas"))).toBe(false);
  });

  it("não inventa TO nem CA: erro claro quando faltam", () => {
    expect(() => computeMassingLimits({ ...moradaPlaza, taxaOcupacao: null })).toThrow(MassingInputError);
    expect(() => computeMassingLimits({ ...moradaPlaza, coeficienteAproveitamento: null })).toThrow(/Coeficiente/);
  });

  it("dimensões e recuos ausentes viram premissas, não silêncio", () => {
    const l = computeMassingLimits({ area: 3500, taxaOcupacao: 60, coeficienteAproveitamento: 100 });
    expect(l.premises.length).toBeGreaterThanOrEqual(4);
    expect(l.envelope.area).toBeCloseTo(3500, 0); // sem recuos informados, envelope = lote (quadrado assumido)
  });
});

describe("reconcileWithAI", () => {
  it("mantém números da IA quando estão dentro dos limites", () => {
    const l = computeMassingLimits(boulevard);
    const r = reconcileWithAI(l, { areaOcupada: 2450, areaMaximaConstruida: 3650, numeroLojas: 18, vagasEstacionamento: 146, volumetriaWidth: 50, volumetriaLength: 49, volumetriaHeight: 9 });
    expect(r.discrepancies).toEqual([]);
    expect(r.numbers.areaMaximaConstruida).toBe(3650);
  });

  it("corrige projeção acima do limite (Morada Plaza: IA 2.100 cabe em TO, mas 2.800 não)", () => {
    const l = computeMassingLimits(moradaPlaza);
    const r = reconcileWithAI(l, { areaOcupada: 2800, areaMaximaConstruida: 2800, numeroLojas: 17, vagasEstacionamento: 150 });
    expect(r.numbers.areaOcupada).toBe(l.reference.footprint);
    expect(r.discrepancies.map((x) => x.field)).toContain("areaOcupada");
  });

  it("vagas abaixo do mínimo são elevadas ao mínimo calculado", () => {
    const l = computeMassingLimits(moradaPlaza);
    const r = reconcileWithAI(l, { areaOcupada: 2100, areaMaximaConstruida: 2100, numeroLojas: 17, vagasEstacionamento: 42 });
    expect(r.numbers.vagasEstacionamento).toBe(84);
    expect(r.discrepancies.find((x) => x.field === "vagasEstacionamento")?.ai).toBe(42);
  });

  it("resposta vazia ou inválida da IA cai nos valores de referência", () => {
    const l = computeMassingLimits(espacoSaude);
    const r = reconcileWithAI(l, { areaOcupada: Number.NaN, numeroLojas: -3 });
    expect(r.numbers.areaOcupada).toBe(l.reference.footprint);
    expect(r.numbers.numeroLojas).toBe(l.stores.suggested);
    expect(r.numbers.volumetriaHeight).toBe(l.reference.height);
    expect(r.discrepancies.length).toBe(7);
  });

  it("bloco de verificação lista limites, premissas e divergências", () => {
    const l = computeMassingLimits(moradaPlaza);
    const r = reconcileWithAI(l, { areaOcupada: 2800, areaMaximaConstruida: 2800, numeroLojas: 17, vagasEstacionamento: 42, volumetriaWidth: 44, volumetriaLength: 47, volumetriaHeight: 4.5 });
    const txt = formatVerificationBlock(l, r);
    expect(txt).toContain("Verificação determinística");
    expect(txt).toContain("Premissas a validar");
    expect(txt).toContain("areaOcupada: IA 2800");
    expect(txt).toContain("Pré-estudo de massa");
  });
});
