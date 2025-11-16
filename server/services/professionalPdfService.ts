import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { PassThrough } from 'stream';
import axios from 'axios';

/**
 * Serviço de geração de PDF profissional no estilo Piazza Nicomedes
 * 
 * Estrutura do PDF:
 * 1. Capa com imagem conceitual + logos + título
 * 2. Página de identidade com logo do projeto
 * 3. Renders 3D fotorrealistas (6-8 vistas)
 * 4. Renders com anotações de área
 * 5. Plantas técnicas com escala e norte
 * 6. Dados técnicos e quadro de áreas
 */

interface ProjectData {
  id: number;
  name: string;
  address: string;
  areaTotal: number;
  taxaOcupacao: number;
  coeficienteAproveitamento: number;
  numeroLojas: number;
  vagasEstacionamento: number;
  images?: Array<{
    url: string;
    type: string;
  }>;
  analysis?: {
    areaOcupada: number;
    areaConstruida: number;
    areaPrivativa: number;
    areaComum: number;
  };
}

interface AreaAnnotation {
  text: string;
  x: number;
  y: number;
}

/**
 * Adiciona anotações de área em uma imagem
 */
async function addAreaAnnotations(
  imageUrl: string,
  annotations: AreaAnnotation[]
): Promise<Buffer> {
  try {
    // Baixar imagem
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Obter dimensões da imagem
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1920;
    const height = metadata.height || 1080;

    // Criar SVG com anotações
    const svgAnnotations = annotations.map(ann => {
      const fontSize = Math.max(24, width / 40);
      const padding = fontSize / 2;
      const textWidth = ann.text.length * fontSize * 0.6;
      
      return `
        <g>
          <rect 
            x="${ann.x - padding}" 
            y="${ann.y - fontSize - padding}" 
            width="${textWidth + padding * 2}" 
            height="${fontSize + padding * 2}"
            fill="rgba(0, 0, 0, 0.7)"
            rx="4"
          />
          <text 
            x="${ann.x}" 
            y="${ann.y}" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            font-weight="bold"
            fill="white"
          >${ann.text}</text>
        </g>
      `;
    }).join('');

    const svg = `
      <svg width="${width}" height="${height}">
        ${svgAnnotations}
      </svg>
    `;

    // Sobrepor SVG na imagem
    const annotatedImage = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    return annotatedImage;
  } catch (error) {
    console.error('Erro ao adicionar anotações:', error);
    // Retornar imagem original em caso de erro
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}

/**
 * Adiciona marca d'água em todas as páginas
 */
function addWatermark(doc: PDFKit.PDFDocument, text: string) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  doc.save();
  doc.opacity(0.3);
  doc.fontSize(10);
  doc.fillColor('#0066CC');
  doc.text(text, pageWidth - 150, 20, {
    width: 130,
    align: 'right'
  });
  doc.restore();
}

/**
 * Cria capa do PDF
 */
async function createCoverPage(
  doc: PDFKit.PDFDocument,
  projectName: string,
  coverImageUrl?: string
) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Adicionar imagem de fundo (se fornecida)
  if (coverImageUrl) {
    try {
      const response = await axios.get(coverImageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data);
      doc.image(imageBuffer, 0, 0, {
        width: pageWidth,
        height: pageHeight,
        cover: [pageWidth, pageHeight]
      });
    } catch (error) {
      console.error('Erro ao carregar imagem de capa:', error);
      // Fundo gradiente azul como fallback
      doc.rect(0, 0, pageWidth, pageHeight).fill('#0066CC');
    }
  } else {
    // Fundo gradiente azul
    doc.rect(0, 0, pageWidth, pageHeight).fill('#0066CC');
  }

  // Faixa branca translúcida para título
  doc.save();
  doc.opacity(0.9);
  doc.rect(0, pageHeight / 2 - 80, pageWidth, 160).fill('white');
  doc.restore();

  // Título
  doc.fillColor('#0066CC');
  doc.fontSize(36);
  doc.font('Helvetica-Bold');
  doc.text('ESTUDO PRELIMINAR', 0, pageHeight / 2 - 50, {
    width: pageWidth,
    align: 'center'
  });

  doc.fontSize(48);
  doc.text(projectName.toUpperCase(), 0, pageHeight / 2 + 10, {
    width: pageWidth,
    align: 'center'
  });

  // Rodapé com data
  doc.fontSize(12);
  doc.fillColor('white');
  doc.text(
    new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }),
    0,
    pageHeight - 50,
    {
      width: pageWidth,
      align: 'center'
    }
  );
}

/**
 * Cria página de identidade do projeto
 */
function createIdentityPage(
  doc: PDFKit.PDFDocument,
  projectName: string
) {
  doc.addPage();
  
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Fundo cinza claro
  doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5');

  // Logo/Nome do projeto centralizado
  doc.fillColor('#0066CC');
  doc.fontSize(72);
  doc.font('Helvetica-Bold');
  doc.text(projectName.toUpperCase(), 0, pageHeight / 2 - 50, {
    width: pageWidth,
    align: 'center'
  });

  // Subtítulo
  doc.fontSize(24);
  doc.fillColor('#666666');
  doc.font('Helvetica');
  doc.text('Estudo Volumétrico Preliminar', 0, pageHeight / 2 + 50, {
    width: pageWidth,
    align: 'center'
  });

  addWatermark(doc, 'Strip Mall Volumetria IA');
}

/**
 * Adiciona render 3D ao PDF
 */
async function addRenderPage(
  doc: PDFKit.PDFDocument,
  imageUrl: string,
  title?: string,
  annotations?: AreaAnnotation[]
) {
  doc.addPage();
  
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  try {
    // Adicionar anotações se fornecidas
    let imageBuffer: Buffer;
    if (annotations && annotations.length > 0) {
      imageBuffer = await addAreaAnnotations(imageUrl, annotations);
    } else {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    }

    // Adicionar imagem em sangria (full bleed)
    doc.image(imageBuffer, 0, 0, {
      width: pageWidth,
      height: pageHeight,
      cover: [pageWidth, pageHeight]
    });

    // Adicionar título se fornecido
    if (title) {
      doc.save();
      doc.opacity(0.9);
      doc.rect(0, 0, pageWidth, 60).fill('#0066CC');
      doc.restore();

      doc.fillColor('white');
      doc.fontSize(24);
      doc.font('Helvetica-Bold');
      doc.text(title.toUpperCase(), 20, 18);
    }

    addWatermark(doc, 'Strip Mall Volumetria IA');
  } catch (error) {
    console.error('Erro ao adicionar render:', error);
    // Página de erro
    doc.fillColor('#666666');
    doc.fontSize(16);
    doc.text('Erro ao carregar imagem', 0, pageHeight / 2, {
      width: pageWidth,
      align: 'center'
    });
  }
}

/**
 * Adiciona página de dados técnicos
 */
function addTechnicalDataPage(
  doc: PDFKit.PDFDocument,
  project: ProjectData
) {
  doc.addPage();
  
  const pageWidth = doc.page.width;
  const margin = 50;

  // Título
  doc.save();
  doc.opacity(0.9);
  doc.rect(0, 0, pageWidth, 60).fill('#0066CC');
  doc.restore();

  doc.fillColor('white');
  doc.fontSize(24);
  doc.font('Helvetica-Bold');
  doc.text('DADOS TÉCNICOS', margin, 18);

  // Conteúdo
  let y = 100;
  doc.fillColor('#333333');
  doc.fontSize(14);
  doc.font('Helvetica-Bold');

  // Dados do terreno
  doc.text('DADOS DO TERRENO', margin, y);
  y += 30;

  doc.font('Helvetica');
  doc.fontSize(12);
  doc.text(`Endereço: ${project.address}`, margin, y);
  y += 20;
  doc.text(`Área Total: ${project.areaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`, margin, y);
  y += 40;

  // Parâmetros urbanísticos
  doc.font('Helvetica-Bold');
  doc.fontSize(14);
  doc.text('PARÂMETROS URBANÍSTICOS', margin, y);
  y += 30;

  doc.font('Helvetica');
  doc.fontSize(12);
  doc.text(`Taxa de Ocupação: ${(project.taxaOcupacao * 100).toFixed(0)}%`, margin, y);
  y += 20;
  doc.text(`Coeficiente de Aproveitamento: ${project.coeficienteAproveitamento.toFixed(2)}`, margin, y);
  y += 40;

  // Quadro de áreas
  if (project.analysis) {
    doc.font('Helvetica-Bold');
    doc.fontSize(14);
    doc.text('QUADRO DE ÁREAS', margin, y);
    y += 30;

    doc.font('Helvetica');
    doc.fontSize(12);
    doc.text(`Área Ocupada: ${project.analysis.areaOcupada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`, margin, y);
    y += 20;
    doc.text(`Área Construída Total: ${project.analysis.areaConstruida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`, margin, y);
    y += 20;
    doc.text(`Área Privativa (Lojas): ${project.analysis.areaPrivativa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`, margin, y);
    y += 20;
    doc.text(`Área Comum: ${project.analysis.areaComum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`, margin, y);
    y += 40;
  }

  // Dados do empreendimento
  doc.font('Helvetica-Bold');
  doc.fontSize(14);
  doc.text('DADOS DO EMPREENDIMENTO', margin, y);
  y += 30;

  doc.font('Helvetica');
  doc.fontSize(12);
  doc.text(`Número de Lojas: ${project.numeroLojas}`, margin, y);
  y += 20;
  doc.text(`Vagas de Estacionamento: ${project.vagasEstacionamento}`, margin, y);

  addWatermark(doc, 'Strip Mall Volumetria IA');
}

/**
 * Gera PDF profissional completo
 */
export async function generateProfessionalPDF(
  project: ProjectData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      doc.pipe(stream);

      // 1. Capa
      const coverImage = project.images?.find(img => img.type === 'aerial_view')?.url;
      await createCoverPage(doc, project.name, coverImage);

      // 2. Página de identidade
      createIdentityPage(doc, project.name);

      // 3. Renders 3D (sem anotações)
      const renderTypes = [
        'aerial_view',
        'street_view',
        'entrance_view',
        'parking_view',
        'side_view',
        'perspective_view'
      ];

      for (const type of renderTypes) {
        const image = project.images?.find(img => img.type === type);
        if (image) {
          await addRenderPage(doc, image.url);
        }
      }

      // 4. Renders com anotações de área (se houver análise)
      if (project.analysis) {
        const annotatedViews = project.images?.filter(img => 
          img.type === 'street_view' || img.type === 'entrance_view'
        );

        for (const image of annotatedViews || []) {
          // Calcular anotações baseadas na análise
          const annotations: AreaAnnotation[] = [
            { text: `${project.analysis.areaPrivativa.toFixed(0)} m²`, x: 300, y: 400 },
            { text: `${project.analysis.areaComum.toFixed(0)} m²`, x: 600, y: 350 }
          ];

          await addRenderPage(
            doc,
            image.url,
            'ÁREA DE VITRINE / PELE DE VIDRO',
            annotations
          );
        }
      }

      // 5. Plantas técnicas
      const sitePlan = project.images?.find(img => img.type === 'site_plan');
      if (sitePlan) {
        await addRenderPage(doc, sitePlan.url, 'TÉRREO');
      }

      // 6. Dados técnicos
      addTechnicalDataPage(doc, project);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
