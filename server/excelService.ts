import ExcelJS from "exceljs";

interface ProjectData {
  id: number;
  name: string;
  description?: string | null;
  area: number;
  width?: number | null;
  length?: number | null;
  taxaOcupacao?: number | null;
  coeficienteAproveitamento?: number | null;
  recuoFrontal?: number | null;
  recuoLateral?: number | null;
  recuoFundos?: number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  createdAt?: Date | null;
}

interface AnalysisData {
  areaMaximaConstruida?: number | null;
  areaOcupada?: number | null;
  numeroLojas?: number | null;
  vagasEstacionamento?: number | null;
  volumetriaWidth?: number | null;
  volumetriaLength?: number | null;
  volumetriaHeight?: number | null;
  layoutDescription?: string | null;
  aiSuggestions?: string | null;
  createdAt?: Date | null;
}

interface FinancialData {
  custoTerreno?: number | null;
  custoConstrucao?: number | null;
  custoTotal?: number | null;
  valorVenda?: number | null;
  valorAluguel?: number | null;
  roi?: number | null;
  tir?: number | null;
  payback?: number | null;
  vpl?: number | null;
}

export async function generateProjectExcel(
  project: ProjectData,
  analysis: AnalysisData | null,
  financial: FinancialData | null
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Strip Mall Volumetria IA";
  workbook.created = new Date();

  // Estilos comuns
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const titleStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 16, color: { argb: "FF1E40AF" } },
    alignment: { horizontal: "left", vertical: "middle" },
  };

  const labelStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const valueStyle: Partial<ExcelJS.Style> = {
    font: { size: 11 },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const currencyFormat = 'R$ #,##0.00';
  const percentFormat = '0.00%';
  const numberFormat = '#,##0';

  // ========== ABA 1: RESUMO DO PROJETO ==========
  const resumoSheet = workbook.addWorksheet("Resumo do Projeto");
  resumoSheet.columns = [
    { width: 30 },
    { width: 40 },
    { width: 20 },
    { width: 20 },
  ];

  // Título
  resumoSheet.mergeCells("A1:D1");
  const titleCell = resumoSheet.getCell("A1");
  titleCell.value = `📊 Análise Volumétrica - ${project.name}`;
  titleCell.style = titleStyle;
  resumoSheet.getRow(1).height = 30;

  // Data de geração
  resumoSheet.mergeCells("A2:D2");
  resumoSheet.getCell("A2").value = `Gerado em: ${new Date().toLocaleString("pt-BR")}`;
  resumoSheet.getCell("A2").style = { font: { italic: true, color: { argb: "FF6B7280" } } };

  // Seção: Dados do Terreno
  let row = 4;
  resumoSheet.mergeCells(`A${row}:D${row}`);
  resumoSheet.getCell(`A${row}`).value = "🏗️ DADOS DO TERRENO";
  resumoSheet.getCell(`A${row}`).style = headerStyle;
  row++;

  const terrenoData = [
    ["Área Total", `${project.area?.toLocaleString("pt-BR")} m²`],
    ["Largura", project.width ? `${project.width} m` : "Não informado"],
    ["Comprimento", project.length ? `${project.length} m` : "Não informado"],
    ["Endereço", project.address || "Não informado"],
    ["Cidade/Estado", `${project.city || ""} ${project.state ? `- ${project.state}` : ""}`],
  ];

  terrenoData.forEach(([label, value]) => {
    resumoSheet.getCell(`A${row}`).value = label;
    resumoSheet.getCell(`A${row}`).style = labelStyle;
    resumoSheet.mergeCells(`B${row}:D${row}`);
    resumoSheet.getCell(`B${row}`).value = value;
    resumoSheet.getCell(`B${row}`).style = valueStyle;
    row++;
  });

  // Seção: Parâmetros Urbanísticos
  row++;
  resumoSheet.mergeCells(`A${row}:D${row}`);
  resumoSheet.getCell(`A${row}`).value = "📐 PARÂMETROS URBANÍSTICOS";
  resumoSheet.getCell(`A${row}`).style = headerStyle;
  row++;

  const urbanosData = [
    ["Taxa de Ocupação", project.taxaOcupacao ? `${project.taxaOcupacao}%` : "Não informado"],
    ["Coeficiente de Aproveitamento", project.coeficienteAproveitamento ? `${(project.coeficienteAproveitamento / 100).toFixed(2)}` : "Não informado"],
    ["Recuo Frontal", project.recuoFrontal ? `${project.recuoFrontal} m` : "Não informado"],
    ["Recuo Lateral", project.recuoLateral ? `${project.recuoLateral} m` : "Não informado"],
    ["Recuo de Fundos", project.recuoFundos ? `${project.recuoFundos} m` : "Não informado"],
  ];

  urbanosData.forEach(([label, value]) => {
    resumoSheet.getCell(`A${row}`).value = label;
    resumoSheet.getCell(`A${row}`).style = labelStyle;
    resumoSheet.mergeCells(`B${row}:D${row}`);
    resumoSheet.getCell(`B${row}`).value = value;
    resumoSheet.getCell(`B${row}`).style = valueStyle;
    row++;
  });

  // ========== ABA 2: ANÁLISE VOLUMÉTRICA ==========
  if (analysis) {
    const volumetriaSheet = workbook.addWorksheet("Análise Volumétrica");
    volumetriaSheet.columns = [
      { width: 35 },
      { width: 25 },
      { width: 25 },
      { width: 25 },
    ];

    // Título
    volumetriaSheet.mergeCells("A1:D1");
    volumetriaSheet.getCell("A1").value = "📊 ANÁLISE VOLUMÉTRICA";
    volumetriaSheet.getCell("A1").style = titleStyle;
    volumetriaSheet.getRow(1).height = 30;

    row = 3;
    volumetriaSheet.mergeCells(`A${row}:D${row}`);
    volumetriaSheet.getCell(`A${row}`).value = "RESULTADOS DA ANÁLISE";
    volumetriaSheet.getCell(`A${row}`).style = headerStyle;
    row++;

    const volumetriaData = [
      ["Área Máxima Construída", analysis.areaMaximaConstruida ? `${analysis.areaMaximaConstruida.toLocaleString("pt-BR")} m²` : "-"],
      ["Área Ocupada (Térreo)", analysis.areaOcupada ? `${analysis.areaOcupada.toLocaleString("pt-BR")} m²` : "-"],
      ["Número de Lojas", analysis.numeroLojas?.toString() || "-"],
      ["Vagas de Estacionamento", analysis.vagasEstacionamento?.toString() || "-"],
    ];

    volumetriaData.forEach(([label, value]) => {
      volumetriaSheet.getCell(`A${row}`).value = label;
      volumetriaSheet.getCell(`A${row}`).style = labelStyle;
      volumetriaSheet.mergeCells(`B${row}:D${row}`);
      volumetriaSheet.getCell(`B${row}`).value = value;
      volumetriaSheet.getCell(`B${row}`).style = valueStyle;
      row++;
    });

    // Dimensões da Volumetria
    row++;
    volumetriaSheet.mergeCells(`A${row}:D${row}`);
    volumetriaSheet.getCell(`A${row}`).value = "DIMENSÕES DA VOLUMETRIA";
    volumetriaSheet.getCell(`A${row}`).style = headerStyle;
    row++;

    const dimensoesData = [
      ["Largura", analysis.volumetriaWidth ? `${analysis.volumetriaWidth} m` : "-"],
      ["Comprimento", analysis.volumetriaLength ? `${analysis.volumetriaLength} m` : "-"],
      ["Altura", analysis.volumetriaHeight ? `${analysis.volumetriaHeight} m` : "-"],
    ];

    dimensoesData.forEach(([label, value]) => {
      volumetriaSheet.getCell(`A${row}`).value = label;
      volumetriaSheet.getCell(`A${row}`).style = labelStyle;
      volumetriaSheet.mergeCells(`B${row}:D${row}`);
      volumetriaSheet.getCell(`B${row}`).value = value;
      volumetriaSheet.getCell(`B${row}`).style = valueStyle;
      row++;
    });

    // Descrição do Layout
    if (analysis.layoutDescription) {
      row++;
      volumetriaSheet.mergeCells(`A${row}:D${row}`);
      volumetriaSheet.getCell(`A${row}`).value = "DESCRIÇÃO DO LAYOUT";
      volumetriaSheet.getCell(`A${row}`).style = headerStyle;
      row++;

      volumetriaSheet.mergeCells(`A${row}:D${row + 3}`);
      volumetriaSheet.getCell(`A${row}`).value = analysis.layoutDescription;
      volumetriaSheet.getCell(`A${row}`).style = { ...valueStyle, alignment: { wrapText: true, vertical: "top" } };
      row += 4;
    }

    // Sugestões da IA
    if (analysis.aiSuggestions) {
      row++;
      volumetriaSheet.mergeCells(`A${row}:D${row}`);
      volumetriaSheet.getCell(`A${row}`).value = "🤖 SUGESTÕES DA IA";
      volumetriaSheet.getCell(`A${row}`).style = headerStyle;
      row++;

      volumetriaSheet.mergeCells(`A${row}:D${row + 5}`);
      volumetriaSheet.getCell(`A${row}`).value = analysis.aiSuggestions;
      volumetriaSheet.getCell(`A${row}`).style = { ...valueStyle, alignment: { wrapText: true, vertical: "top" } };
    }
  }

  // ========== ABA 3: VIABILIDADE FINANCEIRA ==========
  if (financial) {
    const financeiraSheet = workbook.addWorksheet("Viabilidade Financeira");
    financeiraSheet.columns = [
      { width: 35 },
      { width: 25 },
      { width: 25 },
      { width: 25 },
    ];

    // Título
    financeiraSheet.mergeCells("A1:D1");
    financeiraSheet.getCell("A1").value = "💰 VIABILIDADE FINANCEIRA";
    financeiraSheet.getCell("A1").style = titleStyle;
    financeiraSheet.getRow(1).height = 30;

    row = 3;
    financeiraSheet.mergeCells(`A${row}:D${row}`);
    financeiraSheet.getCell(`A${row}`).value = "CUSTOS DO EMPREENDIMENTO";
    financeiraSheet.getCell(`A${row}`).style = headerStyle;
    row++;

    const custosData = [
      ["Custo do Terreno", financial.custoTerreno],
      ["Custo de Construção", financial.custoConstrucao],
      ["Custo Total", financial.custoTotal],
    ];

    custosData.forEach(([label, value]) => {
      financeiraSheet.getCell(`A${row}`).value = label;
      financeiraSheet.getCell(`A${row}`).style = labelStyle;
      financeiraSheet.mergeCells(`B${row}:D${row}`);
      const cell = financeiraSheet.getCell(`B${row}`);
      cell.value = value || 0;
      cell.numFmt = currencyFormat;
      cell.style = valueStyle;
      row++;
    });

    // Receitas
    row++;
    financeiraSheet.mergeCells(`A${row}:D${row}`);
    financeiraSheet.getCell(`A${row}`).value = "RECEITAS PROJETADAS";
    financeiraSheet.getCell(`A${row}`).style = headerStyle;
    row++;

    const receitasData = [
      ["Valor de Venda (VGV)", financial.valorVenda],
      ["Receita de Aluguel (mensal)", financial.valorAluguel],
    ];

    receitasData.forEach(([label, value]) => {
      financeiraSheet.getCell(`A${row}`).value = label;
      financeiraSheet.getCell(`A${row}`).style = labelStyle;
      financeiraSheet.mergeCells(`B${row}:D${row}`);
      const cell = financeiraSheet.getCell(`B${row}`);
      cell.value = value || 0;
      cell.numFmt = currencyFormat;
      cell.style = valueStyle;
      row++;
    });

    // Indicadores
    row++;
    financeiraSheet.mergeCells(`A${row}:D${row}`);
    financeiraSheet.getCell(`A${row}`).value = "INDICADORES FINANCEIROS";
    financeiraSheet.getCell(`A${row}`).style = headerStyle;
    row++;

    const indicadoresData: [string, number | null | undefined, string][] = [
      ["ROI (Retorno sobre Investimento)", financial.roi, "%"],
      ["TIR (Taxa Interna de Retorno)", financial.tir, "%"],
      ["Payback (meses)", financial.payback, " meses"],
      ["VPL (Valor Presente Líquido)", financial.vpl, "currency"],
    ];

    indicadoresData.forEach(([label, value, format]) => {
      financeiraSheet.getCell(`A${row}`).value = label;
      financeiraSheet.getCell(`A${row}`).style = labelStyle;
      financeiraSheet.mergeCells(`B${row}:D${row}`);
      const cell = financeiraSheet.getCell(`B${row}`);
      if (format === "currency") {
        cell.value = value || 0;
        cell.numFmt = currencyFormat;
      } else if (format === "%") {
        cell.value = `${value?.toFixed(2) || 0}%`;
      } else {
        cell.value = `${value || 0}${format}`;
      }
      cell.style = valueStyle;
      row++;
    });
  }

  // ========== ABA 4: BREAKDOWN DE ÁREAS ==========
  const areasSheet = workbook.addWorksheet("Breakdown de Áreas");
  areasSheet.columns = [
    { width: 35 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ];

  // Título
  areasSheet.mergeCells("A1:D1");
  areasSheet.getCell("A1").value = "📐 BREAKDOWN DE ÁREAS";
  areasSheet.getCell("A1").style = titleStyle;
  areasSheet.getRow(1).height = 30;

  row = 3;
  areasSheet.mergeCells(`A${row}:D${row}`);
  areasSheet.getCell(`A${row}`).value = "DISTRIBUIÇÃO DE ÁREAS";
  areasSheet.getCell(`A${row}`).style = headerStyle;
  row++;

  // Cabeçalhos da tabela
  ["Tipo de Área", "Área (m²)", "% do Total", "Observações"].forEach((header, i) => {
    const cell = areasSheet.getCell(row, i + 1);
    cell.value = header;
    cell.style = { ...labelStyle, font: { bold: true } };
  });
  row++;

  // Calcular áreas
  const areaTerreno = project.area || 0;
  const areaOcupada = analysis?.areaOcupada || 0;
  const areaLivre = areaTerreno - areaOcupada;
  const areaEstacionamento = (analysis?.vagasEstacionamento || 0) * 25; // 25m² por vaga
  const areaVerde = Math.max(0, areaLivre - areaEstacionamento);

  const areasData = [
    ["Área Total do Terreno", areaTerreno, 100, "Base de cálculo"],
    ["Área Construída (Projeção)", areaOcupada, (areaOcupada / areaTerreno) * 100, "Ocupação do térreo"],
    ["Área de Estacionamento", areaEstacionamento, (areaEstacionamento / areaTerreno) * 100, `${analysis?.vagasEstacionamento || 0} vagas`],
    ["Área Livre/Verde", areaVerde, (areaVerde / areaTerreno) * 100, "Permeável + circulação"],
    ["Área Máxima Construída", analysis?.areaMaximaConstruida || 0, ((analysis?.areaMaximaConstruida || 0) / areaTerreno) * 100, "Inclui pavimentos"],
  ];

  areasData.forEach(([tipo, area, percent, obs]) => {
    areasSheet.getCell(row, 1).value = tipo;
    areasSheet.getCell(row, 1).style = valueStyle;
    
    const areaCell = areasSheet.getCell(row, 2);
    areaCell.value = area;
    areaCell.numFmt = numberFormat;
    areaCell.style = valueStyle;
    
    const percentCell = areasSheet.getCell(row, 3);
    percentCell.value = `${(percent as number).toFixed(1)}%`;
    percentCell.style = valueStyle;
    
    areasSheet.getCell(row, 4).value = obs;
    areasSheet.getCell(row, 4).style = valueStyle;
    row++;
  });

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
