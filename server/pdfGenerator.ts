import PDFDocument from "pdfkit";
import { Readable } from "stream";
import axios from "axios";
import { calculateAreaBreakdown, formatArea, formatPercentage, formatCoefficient } from "./areaCalculator";
import { calculateFinancialAnalysis, DEFAULT_FINANCIAL_PARAMS, formatCurrency, formatPercent, formatYears } from "./financialCalculator";

/**
 * Função auxiliar para baixar imagem de uma URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 segundos de timeout
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Erro ao baixar imagem ${url}:`, error);
    throw error;
  }
}

interface ProjectData {
  id: number;
  name: string;
  address: string;
  totalArea: number;
  briefing?: string | null;
  pricePerSqm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
}

interface AnalysisData {
  buildableArea: number | null;
  numberOfStores: number | null;
  parkingSpaces: number | null;
  feasibilityScore: number;
  aiAnalysis: string | null;
}

interface ImageData {
  id: number;
  type: string;
  imageUrl: string;
}

interface ReportData {
  project: ProjectData;
  analysis: AnalysisData | null;
  images: ImageData[];
}

export async function generateProjectReport(data: ReportData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Relatório Técnico - ${data.project.name}`,
          Author: "Strip Mall Volumetria IA",
          Subject: "Estudo de Massa e Volumetria",
          CreationDate: new Date(),
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      let currentPage = 1;

      // Helper function to add page number
      const addPageNumber = () => {
        doc
          .fontSize(9)
          .fillColor("#666666")
          .text(
            `Página ${currentPage}`,
            50,
            doc.page.height - 30,
            { align: "center", width: doc.page.width - 100 }
          );
        currentPage++;
      };

      // Helper function to add header
      const addHeader = (title: string) => {
        doc
          .fontSize(10)
          .fillColor("#1e40af")
          .text("Strip Mall Volumetria IA", 50, 30, { align: "left" })
          .fontSize(10)
          .fillColor("#666666")
          .text(new Date().toLocaleDateString("pt-BR"), 50, 30, { align: "right" });
      };

      // ==================== CAPA ====================
      doc
        .fontSize(28)
        .fillColor("#1e40af")
        .font("Helvetica-Bold")
        .text("RELATÓRIO TÉCNICO", 50, 200, { align: "center" });

      doc
        .fontSize(22)
        .fillColor("#333333")
        .font("Helvetica")
        .text("Estudo de Massa e Volumetria", 50, 250, { align: "center" });

      doc
        .fontSize(18)
        .fillColor("#1e40af")
        .font("Helvetica-Bold")
        .text(data.project.name, 50, 320, { align: "center" });

      doc
        .fontSize(12)
        .fillColor("#666666")
        .font("Helvetica")
        .text(data.project.address, 50, 360, { align: "center" });

      doc
        .fontSize(10)
        .fillColor("#999999")
        .text(
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
          50,
          doc.page.height - 100,
          { align: "center" }
        );

      addPageNumber();

      // ==================== DADOS DO TERRENO ====================
      doc.addPage();
      addHeader("Dados do Terreno");

      doc
        .fontSize(20)
        .fillColor("#1e40af")
        .font("Helvetica-Bold")
        .text("1. DADOS DO TERRENO", 50, 80);

      let yPos = 130;

      // Tabela de informações básicas
      doc
        .fontSize(12)
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .text("Informações Básicas", 50, yPos);

      yPos += 25;

      const basicInfo = [
        ["Nome do Projeto", data.project.name],
        ["Endereço", data.project.address],
        ["Área Total do Terreno", `${data.project.totalArea.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`],
        ["Data de Criação", data.project.createdAt.toLocaleDateString("pt-BR")],
      ];

      if (data.project.latitude && data.project.longitude) {
        basicInfo.push([
          "Coordenadas",
          `${data.project.latitude.toFixed(6)}, ${data.project.longitude.toFixed(6)}`,
        ]);
      }

      basicInfo.forEach(([label, value]) => {
        doc
          .fontSize(10)
          .fillColor("#666666")
          .font("Helvetica")
          .text(label + ":", 50, yPos, { continued: true })
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text(" " + value);
        yPos += 20;
      });

      // Briefing
      if (data.project.briefing) {
        yPos += 20;
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("Briefing do Projeto", 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .fillColor("#333333")
          .font("Helvetica")
          .text(data.project.briefing, 50, yPos, {
            width: doc.page.width - 100,
            align: "justify",
          });
      }

      addPageNumber();

      // ==================== ANÁLISE VOLUMÉTRICA ====================
      if (data.analysis) {
        doc.addPage();
        addHeader("Análise Volumétrica");

        doc
          .fontSize(20)
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .text("2. ANÁLISE VOLUMÉTRICA", 50, 80);

        yPos = 130;

        // Calcular quadro de áreas conforme ABNT NBR 12.721
        const areaBreakdown = calculateAreaBreakdown({
          totalLandArea: data.project.totalArea,
          buildableArea: data.analysis.buildableArea || 0,
          numberOfStores: data.analysis.numberOfStores || 0,
          parkingSpaces: data.analysis.parkingSpaces || 0,
          numberOfFloors: 1,
        });

        // Quadro de Áreas ABNT NBR 12.721
        doc
          .fontSize(14)
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .text("QUADRO DE ÁREAS - ABNT NBR 12.721", 50, yPos);

        yPos += 30;

        // Seção 1: Áreas Principais
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("1. ÁREAS PRINCIPAIS", 50, yPos);

        yPos += 20;

        const mainAreas = [
          ["Área do Terreno", formatArea(areaBreakdown.areaTerreno)],
          ["Área Total Construída", formatArea(areaBreakdown.areaTotalConstruida)],
          ["Número de Pavimentos", areaBreakdown.numeroPavimentos.toString()],
        ];

        mainAreas.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 10;

        // Seção 2: Áreas Privativas
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("2. ÁREAS PRIVATIVAS (LOJAS)", 50, yPos);

        yPos += 20;

        const privateAreas = [
          ["Área Privativa Total", formatArea(areaBreakdown.areaPrivativaTotal)],
          ["Número de Lojas", (data.analysis.numberOfStores || 0).toString()],
          ["Área Média por Loja", formatArea(areaBreakdown.areaPrivativaPorLoja)],
          ["Percentual sobre Total", formatPercentage(areaBreakdown.percentualPrivativo)],
        ];

        privateAreas.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 10;

        // Seção 3: Áreas Comuns
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("3. ÁREAS COMUNS", 50, yPos);

        yPos += 20;

        const commonAreas = [
          ["Área Comum Total", formatArea(areaBreakdown.areaComumTotal)],
          ["  - Circulação e Corredores", formatArea(areaBreakdown.areaCirculacao)],
          ["  - Sanitários e Vestiários", formatArea(areaBreakdown.areaSanitarios)],
          ["  - Administrativa e Depósitos", formatArea(areaBreakdown.areaAdministrativa)],
          ["Percentual sobre Total", formatPercentage(areaBreakdown.percentualComum)],
        ];

        commonAreas.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 10;

        // Seção 4: Estacionamento
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("4. ESTACIONAMENTO", 50, yPos);

        yPos += 20;

        const parkingAreas = [
          ["Área de Estacionamento", formatArea(areaBreakdown.areaEstacionamento)],
          ["Número de Vagas", (data.analysis.parkingSpaces || 0).toString()],
          ["Área Média por Vaga", formatArea(areaBreakdown.areaPorVaga)],
          ["Percentual sobre Terreno", formatPercentage(areaBreakdown.percentualEstacionamento)],
        ];

        parkingAreas.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 10;

        // Seção 5: Índices Urbanísticos
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("5. ÍNDICES URBANÍSTICOS", 50, yPos);

        yPos += 20;

        const urbanIndexes = [
          ["Taxa de Ocupação", formatPercentage(areaBreakdown.taxaOcupacao)],
          ["Coeficiente de Aproveitamento", formatCoefficient(areaBreakdown.coeficienteAproveitamento)],
          ["Área Livre", formatArea(areaBreakdown.areaLivre)],
          ["Área Permeável (estimada)", formatArea(areaBreakdown.areaPermeavel)],
        ];

        urbanIndexes.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 10;

        // Score de Viabilidade
        doc
          .fontSize(11)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("6. VIABILIDADE", 50, yPos);

        yPos += 20;

        doc
          .fontSize(9)
          .fillColor("#666666")
          .font("Helvetica")
          .text("Score de Viabilidade", 70, yPos, { continued: true, width: 250 })
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(`${data.analysis.feasibilityScore}/100`, { align: "right" });

        yPos += 25;

        // Análise da IA
        yPos += 20;
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("Análise Detalhada", 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .fillColor("#333333")
          .font("Helvetica")
          .text(data.analysis.aiAnalysis || "Análise não disponível", 50, yPos, {
            width: doc.page.width - 100,
            align: "justify",
          });

        addPageNumber();
      }

      // ==================== ANÁLISE DE VIABILIDADE FINANCEIRA ====================
      if (data.analysis) {
        // Calcular análise financeira
        const landCost = data.project.pricePerSqm 
          ? (data.project.totalArea * (data.project.pricePerSqm / 100))
          : data.project.totalArea * 1000; // R$ 1.000/m² default
        
        const financialInputs = {
          landCost,
          constructionCostPerSqm: DEFAULT_FINANCIAL_PARAMS.constructionCostPerSqm,
          buildableArea: data.analysis.buildableArea || 0,
          numberOfStores: data.analysis.numberOfStores || 0,
          parkingSpaces: data.analysis.parkingSpaces || 0,
          averageRentPerSqm: DEFAULT_FINANCIAL_PARAMS.averageRentPerSqm,
          vacancyRate: DEFAULT_FINANCIAL_PARAMS.vacancyRate,
          annualRentIncrease: DEFAULT_FINANCIAL_PARAMS.annualRentIncrease,
          operationalCostRate: DEFAULT_FINANCIAL_PARAMS.operationalCostRate,
          propertyTaxRate: DEFAULT_FINANCIAL_PARAMS.propertyTaxRate,
          maintenanceRate: DEFAULT_FINANCIAL_PARAMS.maintenanceRate,
          discountRate: DEFAULT_FINANCIAL_PARAMS.discountRate,
          projectionYears: DEFAULT_FINANCIAL_PARAMS.projectionYears,
        };
        
        const financial = calculateFinancialAnalysis(financialInputs);
        
        doc.addPage();
        addHeader("Análise de Viabilidade Financeira");

        doc
          .fontSize(20)
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .text("3. ANÁLISE DE VIABILIDADE FINANCEIRA", 50, 80);

        yPos = 130;

        // Seção 1: Investimento Inicial
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("1. INVESTIMENTO INICIAL", 50, yPos);

        yPos += 20;

        const investmentInfo = [
          ["Custo do Terreno", formatCurrency(financial.landCost)],
          ["Custo de Construção", formatCurrency(financial.constructionCost)],
          ["Investimento Total", formatCurrency(financial.totalInvestment)],
        ];

        investmentInfo.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 15;

        // Seção 2: Receitas Projetadas
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("2. RECEITAS PROJETADAS (ANO 1)", 50, yPos);

        yPos += 20;

        const revenueInfo = [
          ["Receita Bruta Anual", formatCurrency(financial.annualGrossRevenue)],
          ["Receita Líquida Anual", formatCurrency(financial.annualNetRevenue)],
          ["Aluguel Médio", `${formatCurrency(financialInputs.averageRentPerSqm)}/m²/mês`],
          ["Taxa de Vacância", formatPercent(financialInputs.vacancyRate)],
        ];

        revenueInfo.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#333333")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 15;

        // Seção 3: Indicadores de Viabilidade
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("3. INDICADORES DE VIABILIDADE", 50, yPos);

        yPos += 20;

        const viabilityInfo = [
          ["VPL (Valor Presente Líquido)", formatCurrency(financial.npv)],
          ["TIR (Taxa Interna de Retorno)", formatPercent(financial.irr)],
          ["Payback", formatYears(financial.paybackYears)],
          ["Rentabilidade Anual", formatPercent(financial.annualYield / 100)],
          ["Cap Rate", formatPercent(financial.capRate / 100)],
        ];

        viabilityInfo.forEach(([label, value]) => {
          doc
            .fontSize(9)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos, { continued: true, width: 250 })
            .fillColor("#1e40af")
            .font("Helvetica-Bold")
            .text(value, { align: "right" });
          yPos += 18;
        });

        yPos += 15;

        // Seção 4: Análise de Sensibilidade
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("4. ANÁLISE DE SENSIBILIDADE", 50, yPos);

        yPos += 20;

        doc
          .fontSize(8)
          .fillColor("#666666")
          .font("Helvetica")
          .text("Cenário", 70, yPos)
          .text("VPL", 200, yPos)
          .text("TIR", 310, yPos)
          .text("Payback", 420, yPos);

        yPos += 15;

        const scenarios = [
          ["Otimista (+20%)", financial.scenarios.optimistic],
          ["Base", financial.scenarios.base],
          ["Pessimista (-20%)", financial.scenarios.pessimistic],
        ];

        (scenarios as [string, any][]).forEach(([label, scenario]) => {
          doc
            .fontSize(8)
            .fillColor("#666666")
            .font("Helvetica")
            .text(label, 70, yPos)
            .text(formatCurrency(scenario.npv), 200, yPos)
            .text(formatPercent(scenario.irr), 310, yPos)
            .text(formatYears(scenario.paybackYears), 420, yPos);
          yPos += 15;
        });

        yPos += 10;

        // Nota sobre parâmetros
        doc
          .fontSize(8)
          .fillColor("#666666")
          .font("Helvetica-Oblique")
          .text(
            `Parâmetros: Aluguel ${formatCurrency(financialInputs.averageRentPerSqm)}/m²/mês, ` +
            `Vacância ${formatPercent(financialInputs.vacancyRate)}, ` +
            `Reajuste ${formatPercent(financialInputs.annualRentIncrease)}/ano, ` +
            `Taxa de Desconto ${formatPercent(financialInputs.discountRate)}/ano, ` +
            `Projeção ${financialInputs.projectionYears} anos.`,
            50,
            yPos,
            { width: doc.page.width - 100, align: "justify" }
          );

        addPageNumber();
        
        // Página adicional: Fluxo de Caixa Projetado
        doc.addPage();
        addHeader("Fluxo de Caixa Projetado");

        doc
          .fontSize(14)
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .text("FLUXO DE CAIXA PROJETADO (10 ANOS)", 50, 80);

        yPos = 130;

        // Cabeçalho da tabela
        doc
          .fontSize(7)
          .fillColor("#666666")
          .font("Helvetica-Bold")
          .text("Ano", 50, yPos)
          .text("Receita Bruta", 100, yPos)
          .text("Custos Oper.", 200, yPos)
          .text("IPTU", 290, yPos)
          .text("Manutenção", 350, yPos)
          .text("Receita Líq.", 430, yPos);

        yPos += 15;

        // Linhas da tabela
        financial.cashFlow.forEach((year) => {
          doc
            .fontSize(7)
            .fillColor("#333333")
            .font("Helvetica")
            .text(year.year.toString(), 50, yPos)
            .text(formatCurrency(year.grossRevenue).replace("R$", "").trim(), 100, yPos)
            .text(formatCurrency(year.operationalCosts).replace("R$", "").trim(), 200, yPos)
            .text(formatCurrency(year.propertyTax).replace("R$", "").trim(), 290, yPos)
            .text(formatCurrency(year.maintenance).replace("R$", "").trim(), 350, yPos)
            .text(formatCurrency(year.netRevenue).replace("R$", "").trim(), 430, yPos);
          yPos += 12;
        });

        addPageNumber();
      }

      // ==================== IMAGENS GERADAS ====================
      if (data.images.length > 0) {
        const imageTypes = [
          { type: "electronic_model", title: "Maquete Eletrônica - Vista Isométrica" },
          { type: "front_facade", title: "Fachada Frontal" },
          { type: "back_facade", title: "Fachada Posterior" },
          { type: "left_facade", title: "Fachada Lateral Esquerda" },
          { type: "right_facade", title: "Fachada Lateral Direita" },
          { type: "floor_plan", title: "Planta Baixa" },
          { type: "site_plan", title: "Planta de Implantação" },
          { type: "longitudinal_section", title: "Corte Longitudinal" },
          { type: "transversal_section", title: "Corte Transversal" },
        ];

        let sectionNumber = data.project.pricePerSqm ? 4 : data.analysis ? 3 : 2;

        for (const imageType of imageTypes) {
          const imagesOfType = data.images.filter((img) => img.type === imageType.type);

          if (imagesOfType.length > 0) {
            doc.addPage();
            addHeader(imageType.title);

            doc
              .fontSize(20)
              .fillColor("#1e40af")
              .font("Helvetica-Bold")
              .text(`${sectionNumber}. ${imageType.title.toUpperCase()}`, 50, 80);

            // Baixar e inserir a imagem real
            try {
              const imageBuffer = await downloadImage(imagesOfType[0].imageUrl);
              
              // Calcular dimensões para caber na página mantendo proporção
              const maxWidth = doc.page.width - 100; // margens de 50px de cada lado
              const maxHeight = doc.page.height - 200; // espaço para título e rodapé
              
              // Inserir imagem centralizada
              doc.image(imageBuffer, 50, 130, {
                fit: [maxWidth, maxHeight],
                align: 'center',
                valign: 'center',
              });
              
              // Adicionar legenda abaixo da imagem
              doc
                .fontSize(9)
                .fillColor("#666666")
                .font("Helvetica-Oblique")
                .text(
                  `Figura ${sectionNumber}: ${imageType.title}`,
                  50,
                  doc.page.height - 80,
                  { align: "center", width: doc.page.width - 100 }
                );
            } catch (error) {
              // Se falhar ao baixar a imagem, mostrar placeholder
              console.error(`Erro ao processar imagem ${imageType.title}:`, error);
              doc
                .fontSize(10)
                .fillColor("#999999")
                .font("Helvetica")
                .text(
                  `[Imagem não disponível: ${imageType.title}]`,
                  50,
                  150,
                  { align: "center" }
                );
            }

            addPageNumber();
            sectionNumber++;
          }
        }
      }

      // ==================== CONCLUSÃO ====================
      doc.addPage();
      addHeader("Conclusão");

      doc
        .fontSize(20)
        .fillColor("#1e40af")
        .font("Helvetica-Bold")
        .text("CONCLUSÃO", 50, 80);

      yPos = 130;

      doc
        .fontSize(10)
        .fillColor("#333333")
        .font("Helvetica")
        .text(
          "Este relatório técnico apresenta o estudo de massa e volumetria para o projeto de strip mall, " +
          "incluindo análises detalhadas do terreno, cálculos de área construída, distribuição de lojas, " +
          "vagas de estacionamento e visualizações arquitetônicas geradas por inteligência artificial.",
          50,
          yPos,
          { width: doc.page.width - 100, align: "justify" }
        );

      yPos += 80;

      if (data.analysis) {
        doc
          .fontSize(10)
          .fillColor("#333333")
          .font("Helvetica")
          .text(
            `O projeto apresenta um score de viabilidade de ${data.analysis.feasibilityScore}/100, ` +
            `com potencial para ${data.analysis.numberOfStores || 0} lojas e ${data.analysis.parkingSpaces || 0} vagas de estacionamento ` +
            `em uma área construída de ${(data.analysis.buildableArea || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} m².`,
            50,
            yPos,
            { width: doc.page.width - 100, align: "justify" }
          );
      }

      yPos += 100;

      doc
        .fontSize(9)
        .fillColor("#999999")
        .font("Helvetica")
        .text(
          "Relatório gerado automaticamente pelo sistema Strip Mall Volumetria IA",
          50,
          yPos,
          { align: "center" }
        );

      addPageNumber();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
