import PDFDocument from "pdfkit";
import { Readable } from "stream";

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
  return new Promise((resolve, reject) => {
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

        // Quadro de Áreas
        doc
          .fontSize(12)
          .fillColor("#333333")
          .font("Helvetica-Bold")
          .text("Quadro de Áreas e Quantitativos", 50, yPos);

        yPos += 25;

        const areaInfo = [
          ["Área do Terreno", `${data.project.totalArea.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`],
          ["Área Construída", `${(data.analysis.buildableArea || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`],
          ["Número de Lojas", (data.analysis.numberOfStores || 0).toString()],
          ["Vagas de Estacionamento", (data.analysis.parkingSpaces || 0).toString()],
          ["Score de Viabilidade", `${data.analysis.feasibilityScore}/100`],
        ];

        areaInfo.forEach(([label, value]) => {
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

      // ==================== ANÁLISE FINANCEIRA ====================
      if (data.project.pricePerSqm) {
        doc.addPage();
        addHeader("Análise Financeira");

        doc
          .fontSize(20)
          .fillColor("#1e40af")
          .font("Helvetica-Bold")
          .text("3. ANÁLISE FINANCEIRA", 50, 80);

        yPos = 130;

        const pricePerSqm = data.project.pricePerSqm / 100; // Convert from cents
        const totalCost = (data.project.totalArea * pricePerSqm);

        const financialInfo = [
          ["Preço por m²", `R$ ${pricePerSqm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ["Área Total", `${data.project.totalArea.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`],
          ["Custo Total Estimado", `R$ ${totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ];

        if (data.analysis && data.analysis.buildableArea) {
          const costPerSqmBuilt = totalCost / data.analysis.buildableArea;
          financialInfo.push([
            "Custo por m² Construído",
            `R$ ${costPerSqmBuilt.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ]);
        }

        financialInfo.forEach(([label, value]) => {
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

            // Note: PDFKit doesn't support loading images from URLs directly
            // In a real implementation, you would need to download the images first
            doc
              .fontSize(10)
              .fillColor("#666666")
              .font("Helvetica")
              .text(
                `[Imagem: ${imageType.title}]`,
                50,
                150,
                { align: "center" }
              );

            doc
              .fontSize(9)
              .fillColor("#999999")
              .text(
                `URL: ${imagesOfType[0].imageUrl}`,
                50,
                doc.page.height - 80,
                { align: "center", width: doc.page.width - 100 }
              );

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
