/**
 * Consistency PDF Generator
 * 
 * Gera relatório PDF profissional analisando a consistência
 * dos estudos gerados com o DNA do projeto.
 */

import PDFDocument from 'pdfkit';
import { ConsistencyReport, StudyAnalysisResult, ConsistencyIssue } from './studyConsistencyAnalyzer';
import { ProjectDNA } from './projectDNAService';

/**
 * Gera PDF do relatório de consistência
 */
export async function generateConsistencyPDF(report: ConsistencyReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Relatório de Consistência - ${report.projectName}`,
          Author: 'Strip Mall Volumetria IA',
          Subject: 'Análise de Consistência do DNA do Projeto',
          CreationDate: report.generatedAt,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Gerar conteúdo do PDF
      addHeader(doc, report);
      addOverallScore(doc, report);
      addDNASummary(doc, report.dna);
      addStudyAnalyses(doc, report.studyAnalyses);
      addRecommendations(doc, report.recommendations);
      addFooter(doc, report);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Adiciona cabeçalho do relatório
 */
function addHeader(doc: PDFKit.PDFDocument, report: ConsistencyReport): void {
  doc
    .fontSize(24)
    .fillColor('#2C3E50')
    .text('Relatório de Consistência', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(16)
    .fillColor('#34495E')
    .text(report.projectName, { align: 'center' })
    .moveDown(0.3);

  doc
    .fontSize(10)
    .fillColor('#7F8C8D')
    .text(`Gerado em ${formatDate(report.generatedAt)}`, { align: 'center' })
    .moveDown(1.5);

  // Linha separadora
  doc
    .strokeColor('#BDC3C7')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(1);
}

/**
 * Adiciona score geral
 */
function addOverallScore(doc: PDFKit.PDFDocument, report: ConsistencyReport): void {
  const scoreColor = getScoreColor(report.overallScore);

  doc
    .fontSize(14)
    .fillColor('#2C3E50')
    .text('Score Geral de Consistência', { continued: false })
    .moveDown(0.5);

  // Círculo com score
  const centerX = 300;
  const centerY = doc.y + 40;
  const radius = 35;

  doc
    .circle(centerX, centerY, radius)
    .fillAndStroke(scoreColor, '#2C3E50')
    .fill();

  doc
    .fontSize(28)
    .fillColor('#FFFFFF')
    .text(`${report.overallScore}%`, centerX - 30, centerY - 12, {
      width: 60,
      align: 'center',
    });

  doc.y = centerY + radius + 15;

  doc
    .fontSize(11)
    .fillColor('#34495E')
    .text(report.summary, { align: 'center', width: 495 })
    .moveDown(1.5);
}

/**
 * Adiciona resumo do DNA
 */
function addDNASummary(doc: PDFKit.PDFDocument, dna: ProjectDNA): void {
  addSectionTitle(doc, 'DNA do Projeto');

  // Estilo
  doc
    .fontSize(11)
    .fillColor('#2C3E50')
    .text('Estilo Arquitetônico:', { continued: true })
    .fillColor('#34495E')
    .text(` ${dna.style}`)
    .moveDown(0.5);

  // Cores
  doc
    .fontSize(11)
    .fillColor('#2C3E50')
    .text('Cores:', { continued: false })
    .moveDown(0.3);

  doc
    .fontSize(10)
    .fillColor('#34495E')
    .text(`  • Principal: ${dna.primaryColor}`)
    .text(`  • Destaque: ${dna.accentColor}`)
    .moveDown(0.5);

  // Materiais
  doc
    .fontSize(11)
    .fillColor('#2C3E50')
    .text('Materiais:', { continued: false })
    .moveDown(0.3);

  dna.materials.slice(0, 3).forEach(material => {
    doc
      .fontSize(10)
      .fillColor('#34495E')
      .text(`  • ${truncate(material, 80)}`);
  });

  doc.moveDown(0.5);

  // Features obrigatórias
  const mandatoryFeatures = dna.features.filter(f => f.includes('OBRIGATÓRIO'));
  if (mandatoryFeatures.length > 0) {
    doc
      .fontSize(11)
      .fillColor('#2C3E50')
      .text('Features Obrigatórias:', { continued: false })
      .moveDown(0.3);

    mandatoryFeatures.slice(0, 3).forEach(feature => {
      doc
        .fontSize(10)
        .fillColor('#34495E')
        .text(`  • ${truncate(feature.replace('OBRIGATÓRIO:', '').trim(), 70)}`);
    });
  }

  doc.moveDown(1.5);
}

/**
 * Adiciona análises dos estudos
 */
function addStudyAnalyses(doc: PDFKit.PDFDocument, analyses: StudyAnalysisResult[]): void {
  addSectionTitle(doc, 'Análise dos Estudos');

  analyses.forEach((analysis, index) => {
    // Verificar se precisa de nova página
    if (doc.y > 650) {
      doc.addPage();
    }

    addStudyAnalysis(doc, analysis);

    if (index < analyses.length - 1) {
      doc.moveDown(1);
    }
  });
}

/**
 * Adiciona análise de um estudo específico
 */
function addStudyAnalysis(doc: PDFKit.PDFDocument, analysis: StudyAnalysisResult): void {
  const scoreColor = getScoreColor(analysis.score);

  // Título do estudo com score
  doc
    .fontSize(12)
    .fillColor('#2C3E50')
    .text(analysis.studyType, { continued: true })
    .fillColor(scoreColor)
    .text(` - ${analysis.score}%`, { align: 'left' })
    .moveDown(0.5);

  // Pontos fortes
  if (analysis.strengths.length > 0) {
    doc
      .fontSize(10)
      .fillColor('#27AE60')
      .text('✓ Pontos Fortes:', { continued: false })
      .fillColor('#34495E');

    analysis.strengths.slice(0, 3).forEach(strength => {
      doc.fontSize(9).text(`  • ${truncate(strength, 70)}`);
    });

    doc.moveDown(0.3);
  }

  // Issues
  if (analysis.issues.length > 0) {
    doc
      .fontSize(10)
      .fillColor('#E74C3C')
      .text('⚠ Pontos de Atenção:', { continued: false })
      .fillColor('#34495E');

    analysis.issues.slice(0, 5).forEach(issue => {
      const icon = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ';
      doc
        .fontSize(9)
        .text(`  ${icon} ${truncate(issue.description, 65)}`);
    });

    if (analysis.issues.length > 5) {
      doc
        .fontSize(9)
        .fillColor('#7F8C8D')
        .text(`  ... e mais ${analysis.issues.length - 5} itens`);
    }
  }

  doc.moveDown(0.8);

  // Linha separadora
  doc
    .strokeColor('#ECF0F1')
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(0.8);
}

/**
 * Adiciona recomendações
 */
function addRecommendations(doc: PDFKit.PDFDocument, recommendations: string[]): void {
  // Verificar se precisa de nova página
  if (doc.y > 600) {
    doc.addPage();
  }

  addSectionTitle(doc, 'Recomendações');

  recommendations.forEach((recommendation, index) => {
    doc
      .fontSize(10)
      .fillColor('#34495E')
      .text(`${index + 1}. ${recommendation}`, {
        width: 495,
        align: 'left',
      })
      .moveDown(0.5);
  });

  doc.moveDown(1);
}

/**
 * Adiciona rodapé
 */
function addFooter(doc: PDFKit.PDFDocument, report: ConsistencyReport): void {
  const pageCount = doc.bufferedPageRange().count;

  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    doc
      .fontSize(8)
      .fillColor('#95A5A6')
      .text(
        `Strip Mall Volumetria IA | Página ${i + 1} de ${pageCount}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: 495 }
      );
  }
}

/**
 * Adiciona título de seção
 */
function addSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc
    .fontSize(14)
    .fillColor('#2C3E50')
    .text(title, { continued: false })
    .moveDown(0.8);
}

/**
 * Retorna cor baseada no score
 */
function getScoreColor(score: number): string {
  if (score >= 90) return '#27AE60'; // Verde
  if (score >= 75) return '#F39C12'; // Laranja
  if (score >= 60) return '#E67E22'; // Laranja escuro
  return '#E74C3C'; // Vermelho
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Trunca texto se exceder o limite
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
