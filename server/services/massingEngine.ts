/**
 * Motor determinístico de estudo de massa.
 *
 * Calcula, a partir dos dados do projeto, os limites que NENHUMA análise pode
 * ultrapassar (envelope após recuos, taxa de ocupação, coeficiente de
 * aproveitamento) e as grandezas derivadas (vagas, faixa de lojas, volumetria
 * de referência). A IA continua escrevendo o texto do estudo, mas os números
 * gravados passam por `reconcileWithAI`, que substitui qualquer valor fora dos
 * limites pelo valor calculado e registra a divergência.
 *
 * Regra: nenhum parâmetro urbanístico é inventado. O que faltar vira premissa
 * explícita em `premises` (e, para TO/CA, erro).
 */

export interface MassingInput {
  area: number; // m²
  width?: number | null; // m (frente)
  length?: number | null; // m (profundidade)
  taxaOcupacao?: number | null; // % (ex.: 70)
  coeficienteAproveitamento?: number | null; // ×100 (ex.: 180 = 1,8), como está no schema
  recuoFrontal?: number | null;
  recuoLateral?: number | null;
  recuoFundos?: number | null;
  /** m² de área construída por vaga. Padrão 25, igual ao prompt histórico; é premissa, não lei. */
  m2PerParkingSpace?: number;
  /** Faixa de área de loja usada para estimar a quantidade (padrão 50–150 m²). */
  storeAreaRange?: { min: number; max: number };
  /** Pavimentos máximos considerados na volumetria de referência (padrão 2). */
  maxFloors?: number;
}

export interface MassingLimits {
  /** Envelope útil após recuos. */
  envelope: { width: number; length: number; area: number };
  /** Projeção máxima no térreo = min(TO × terreno, envelope). */
  maxFootprint: number;
  /** Área construída máxima = CA × terreno. */
  maxGrossFloorArea: number;
  /** Volumetria de referência que respeita os três limites. */
  reference: {
    footprint: number;
    floors: number;
    grossFloorArea: number;
    width: number;
    length: number;
    height: number;
    occupancyRate: number; // fração
    farUsed: number;
  };
  parking: { required: number; m2PerSpace: number };
  stores: { min: number; max: number; suggested: number };
  /** Premissas assumidas por falta de dado. Devem aparecer no estudo. */
  premises: string[];
}

export class MassingInputError extends Error {}

const FLOOR_HEIGHT_M = 4.5;

export function computeMassingLimits(input: MassingInput): MassingLimits {
  const premises: string[] = [];
  if (!(input.area > 0)) throw new MassingInputError("Área do terreno é obrigatória e deve ser maior que zero");
  if (input.taxaOcupacao == null || !(input.taxaOcupacao > 0)) {
    throw new MassingInputError("Taxa de ocupação não informada: informe o parâmetro da zona antes de analisar");
  }
  if (input.coeficienteAproveitamento == null || !(input.coeficienteAproveitamento > 0)) {
    throw new MassingInputError("Coeficiente de aproveitamento não informado: informe o parâmetro da zona antes de analisar");
  }

  const to = input.taxaOcupacao / 100;
  const ca = input.coeficienteAproveitamento / 100;

  let width = input.width ?? 0;
  let length = input.length ?? 0;
  if (!(width > 0) || !(length > 0)) {
    const side = Math.sqrt(input.area);
    width = width > 0 ? width : length > 0 ? input.area / length : side;
    length = length > 0 ? length : input.area / width;
    premises.push(`Dimensões do terreno não informadas: adotado ${fmt(width)} × ${fmt(length)} m para o cálculo dos recuos`);
  }

  const setback = (v: number | null | undefined, name: string) => {
    if (v == null) {
      premises.push(`Recuo ${name} não informado: adotado 0 m (confirmar na lei de uso do solo)`);
      return 0;
    }
    return Math.max(0, v);
  };
  const front = setback(input.recuoFrontal, "frontal");
  const side = setback(input.recuoLateral, "lateral");
  const back = setback(input.recuoFundos, "de fundos");

  const envWidth = Math.max(0, width - 2 * side);
  const envLength = Math.max(0, length - front - back);
  const envelope = { width: envWidth, length: envLength, area: round2(envWidth * envLength) };

  const maxFootprint = round2(Math.min(to * input.area, envelope.area));
  const maxGrossFloorArea = round2(ca * input.area);

  const maxFloors = Math.max(1, Math.floor(input.maxFloors ?? 2));
  const footprint = round2(Math.min(maxFootprint, maxGrossFloorArea));
  const floors = footprint > 0 ? Math.max(1, Math.min(maxFloors, Math.floor(maxGrossFloorArea / footprint))) : 1;
  const grossFloorArea = round2(Math.min(footprint * floors, maxGrossFloorArea));

  // volumetria de referência: ocupa a largura do envelope e a profundidade necessária
  const refWidth = envelope.width > 0 ? envelope.width : 0;
  const refLength = refWidth > 0 ? round2(Math.min(envelope.length, footprint / refWidth)) : 0;

  const m2PerSpace = input.m2PerParkingSpace ?? 25;
  if (input.m2PerParkingSpace == null) {
    premises.push("Índice de vagas não informado: adotado 1 vaga a cada 25 m² construídos (confirmar na legislação municipal)");
  }
  const range = input.storeAreaRange ?? { min: 50, max: 150 };

  return {
    envelope,
    maxFootprint,
    maxGrossFloorArea,
    reference: {
      footprint,
      floors,
      grossFloorArea,
      width: round2(refWidth),
      length: refLength,
      height: round2(floors * FLOOR_HEIGHT_M),
      occupancyRate: input.area > 0 ? footprint / input.area : 0,
      farUsed: input.area > 0 ? grossFloorArea / input.area : 0,
    },
    parking: { required: Math.ceil(grossFloorArea / m2PerSpace), m2PerSpace },
    stores: {
      min: Math.floor(grossFloorArea / range.max),
      max: Math.floor(grossFloorArea / range.min),
      suggested: Math.max(1, Math.round(grossFloorArea / ((range.min + range.max) / 2))),
    },
    premises,
  };
}

/** Campos numéricos que a IA devolve e que gravamos em `analyses`. */
export interface AIAnalysisNumbers {
  areaMaximaConstruida?: number | null;
  areaOcupada?: number | null;
  numeroLojas?: number | null;
  vagasEstacionamento?: number | null;
  volumetriaWidth?: number | null;
  volumetriaLength?: number | null;
  volumetriaHeight?: number | null;
}

export interface Discrepancy {
  field: keyof AIAnalysisNumbers;
  ai: number | null | undefined;
  adopted: number;
  reason: string;
}

export interface ReconciledAnalysis {
  numbers: Record<keyof AIAnalysisNumbers, number>;
  discrepancies: Discrepancy[];
}

/**
 * Compara os números da IA com os limites e adota o valor calculado sempre que
 * a IA ultrapassar um limite ou não responder. Números dentro dos limites são
 * mantidos (a IA pode propor menos que o máximo).
 */
export function reconcileWithAI(limits: MassingLimits, ai: AIAnalysisNumbers): ReconciledAnalysis {
  const d: Discrepancy[] = [];
  const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

  const pick = (
    field: keyof AIAnalysisNumbers,
    fallback: number,
    ok: (v: number) => boolean,
    reason: string,
  ): number => {
    const v = num(ai[field]);
    if (v == null) {
      d.push({ field, ai: ai[field], adopted: fallback, reason: "IA não informou um número válido" });
      return fallback;
    }
    if (!ok(v)) {
      d.push({ field, ai: v, adopted: fallback, reason });
      return fallback;
    }
    return v;
  };

  const areaOcupada = pick(
    "areaOcupada",
    limits.reference.footprint,
    (v) => v <= limits.maxFootprint + 1e-6,
    `Projeção acima do máximo (TO/envelope): ${fmt(limits.maxFootprint)} m²`,
  );
  const areaMaximaConstruida = pick(
    "areaMaximaConstruida",
    limits.reference.grossFloorArea,
    (v) => v <= limits.maxGrossFloorArea + 1e-6 && v >= areaOcupada - 1e-6,
    `Área construída fora da faixa [projeção, CA × terreno = ${fmt(limits.maxGrossFloorArea)} m²]`,
  );
  const requiredParking = Math.ceil(areaMaximaConstruida / limits.parking.m2PerSpace);
  const vagasEstacionamento = pick(
    "vagasEstacionamento",
    requiredParking,
    (v) => v >= requiredParking,
    `Vagas abaixo do mínimo (1/${limits.parking.m2PerSpace} m²): ${requiredParking}`,
  );
  const numeroLojas = pick(
    "numeroLojas",
    limits.stores.suggested,
    (v) => v >= 1 && v <= Math.max(1, Math.floor(areaMaximaConstruida / 30)),
    "Número de lojas incompatível com a área construída",
  );
  const volumetriaWidth = pick(
    "volumetriaWidth",
    limits.reference.width,
    (v) => v <= limits.envelope.width + 1e-6,
    `Largura maior que o envelope (${fmt(limits.envelope.width)} m)`,
  );
  const volumetriaLength = pick(
    "volumetriaLength",
    limits.reference.length,
    (v) => v <= limits.envelope.length + 1e-6,
    `Comprimento maior que o envelope (${fmt(limits.envelope.length)} m)`,
  );
  const volumetriaHeight = pick(
    "volumetriaHeight",
    limits.reference.height,
    (v) => v > 0 && v <= 60,
    "Altura implausível para strip mall",
  );

  return {
    numbers: { areaOcupada, areaMaximaConstruida, vagasEstacionamento, numeroLojas, volumetriaWidth, volumetriaLength, volumetriaHeight },
    discrepancies: d,
  };
}

/** Bloco em Markdown anexado ao estudo: limites, premissas e divergências corrigidas. */
export function formatVerificationBlock(limits: MassingLimits, rec: ReconciledAnalysis): string {
  const lines = [
    "",
    "---",
    "### Verificação determinística (calculada pelo sistema, não pela IA)",
    `- Envelope após recuos: ${fmt(limits.envelope.width)} × ${fmt(limits.envelope.length)} m = ${fmt(limits.envelope.area)} m²`,
    `- Projeção máxima (TO/envelope): ${fmt(limits.maxFootprint)} m² · Área construída máxima (CA): ${fmt(limits.maxGrossFloorArea)} m²`,
    `- Adotado: projeção ${fmt(rec.numbers.areaOcupada)} m², área construída ${fmt(rec.numbers.areaMaximaConstruida)} m², ${rec.numbers.vagasEstacionamento} vagas, ${rec.numbers.numeroLojas} lojas`,
  ];
  if (limits.premises.length) {
    lines.push("", "**Premissas a validar:**");
    for (const p of limits.premises) lines.push(`- ${p}`);
  }
  if (rec.discrepancies.length) {
    lines.push("", "**Valores da IA corrigidos pelo cálculo:**");
    for (const x of rec.discrepancies) lines.push(`- ${x.field}: IA ${x.ai ?? "—"} → adotado ${fmt(x.adopted)} (${x.reason})`);
  } else {
    lines.push("", "Todos os números da IA ficaram dentro dos limites calculados.");
  }
  lines.push("", "_Pré-estudo de massa. Não substitui projeto de arquitetura nem aprovação legal._");
  return lines.join("\n");
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
