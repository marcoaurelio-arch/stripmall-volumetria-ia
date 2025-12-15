import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Interface para dados extraídos de um PDF
 */
export interface ExtractedPDFData {
  area?: number;
  width?: number;
  length?: number;
  recuoFrontal?: number;
  recuoLateral?: number;
  recuoFundos?: number;
  taxaOcupacao?: number;
  coeficienteAproveitamento?: number;
  rawText: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Extrai texto de um PDF usando pdfjs-dist
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Carregar o documento PDF
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Extrair texto de cada página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extrai dimensões de texto usando regex
 * Suporta formatos como:
 * - "10m x 20m"
 * - "largura: 10m"
 * - "comprimento: 20m"
 * - "10,5 x 20,3"
 */
function extractDimensions(text: string): { width?: number; length?: number } {
  const result: { width?: number; length?: number } = {};

  // Padrão para "X x Y" ou "X,X x Y,Y"
  const dimensionPattern = /(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*m?/g;
  const matches = text.match(dimensionPattern);
  
  if (matches && matches.length > 0) {
    const firstMatch = matches[0];
    const numbers = firstMatch.match(/(\d+(?:[.,]\d+)?)/g);
    if (numbers && numbers.length >= 2) {
      result.width = parseFloat(numbers[0].replace(",", "."));
      result.length = parseFloat(numbers[1].replace(",", "."));
    }
  }

  // Padrão para "largura: X" ou "width: X"
  const widthPattern = /(?:largura|width|frente)[\s:]+(\d+(?:[.,]\d+)?)\s*m?/gi;
  const widthMatch = text.match(widthPattern);
  if (widthMatch && widthMatch.length > 0) {
    const numbers = widthMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      result.width = parseFloat(numbers[0].replace(",", "."));
    }
  }

  // Padrão para "comprimento: Y" ou "length: Y"
  const lengthPattern = /(?:comprimento|length|fundo|profundidade)[\s:]+(\d+(?:[.,]\d+)?)\s*m?/gi;
  const lengthMatch = text.match(lengthPattern);
  if (lengthMatch && lengthMatch.length > 0) {
    const numbers = lengthMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      result.length = parseFloat(numbers[0].replace(",", "."));
    }
  }

  return result;
}

/**
 * Extrai área total do texto
 * Suporta formatos como:
 * - "área: 500m²"
 * - "area total: 500,50 m2"
 * - "500m²"
 */
function extractArea(text: string): number | undefined {
  // Padrão para área com label
  const areaPattern = /(?:área|area)[\s:]+(\d+(?:[.,]\d+)?)\s*m[²2]?/gi;
  const matches = text.match(areaPattern);
  
  if (matches && matches.length > 0) {
    const numbers = matches[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      return parseFloat(numbers[0].replace(",", "."));
    }
  }

  // Padrão para área sem label (apenas número seguido de m²)
  const simpleAreaPattern = /(\d+(?:[.,]\d+)?)\s*m[²2]/gi;
  const simpleMatches = text.match(simpleAreaPattern);
  
  if (simpleMatches && simpleMatches.length > 0) {
    const numbers = simpleMatches[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      const area = parseFloat(numbers[0].replace(",", "."));
      // Filtrar áreas muito pequenas que provavelmente não são área total
      if (area > 100) {
        return area;
      }
    }
  }

  return undefined;
}

/**
 * Extrai recuos do texto
 * Suporta formatos como:
 * - "recuo frontal: 5m"
 * - "recuo lateral: 3m"
 * - "recuo de fundos: 3m"
 */
function extractSetbacks(text: string): {
  recuoFrontal?: number;
  recuoLateral?: number;
  recuoFundos?: number;
} {
  const result: {
    recuoFrontal?: number;
    recuoLateral?: number;
    recuoFundos?: number;
  } = {};

  // Recuo frontal
  const frontalPattern = /(?:recuo\s+frontal|afastamento\s+frontal)[\s:]+(\d+(?:[.,]\d+)?)\s*m?/gi;
  const frontalMatch = text.match(frontalPattern);
  if (frontalMatch && frontalMatch.length > 0) {
    const numbers = frontalMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      result.recuoFrontal = parseFloat(numbers[0].replace(",", "."));
    }
  }

  // Recuo lateral
  const lateralPattern = /(?:recuo\s+lateral|afastamento\s+lateral)[\s:]+(\d+(?:[.,]\d+)?)\s*m?/gi;
  const lateralMatch = text.match(lateralPattern);
  if (lateralMatch && lateralMatch.length > 0) {
    const numbers = lateralMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      result.recuoLateral = parseFloat(numbers[0].replace(",", "."));
    }
  }

  // Recuo de fundos
  const fundosPattern = /(?:recuo\s+(?:de\s+)?fundos?|afastamento\s+(?:de\s+)?fundos?)[\s:]+(\d+(?:[.,]\d+)?)\s*m?/gi;
  const fundosMatch = text.match(fundosPattern);
  if (fundosMatch && fundosMatch.length > 0) {
    const numbers = fundosMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      result.recuoFundos = parseFloat(numbers[0].replace(",", "."));
    }
  }

  return result;
}

/**
 * Extrai taxa de ocupação do texto
 * Suporta formatos como:
 * - "taxa de ocupação: 70%"
 * - "TO: 0.7"
 * - "ocupação: 70"
 */
function extractTaxaOcupacao(text: string): number | undefined {
  // Padrão para taxa com %
  const percentPattern = /(?:taxa\s+de\s+ocupação|TO|ocupação)[\s:]+(\d+(?:[.,]\d+)?)\s*%/gi;
  const percentMatch = text.match(percentPattern);
  
  if (percentMatch && percentMatch.length > 0) {
    const numbers = percentMatch[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      const value = parseFloat(numbers[0].replace(",", "."));
      return value / 100; // Converter para decimal
    }
  }

  // Padrão para taxa em decimal (0.x)
  const decimalPattern = /(?:taxa\s+de\s+ocupação|TO|ocupação)[\s:]+0[.,](\d+)/gi;
  const decimalMatch = text.match(decimalPattern);
  
  if (decimalMatch && decimalMatch.length > 0) {
    const numbers = decimalMatch[0].match(/0[.,](\d+)/);
    if (numbers) {
      return parseFloat(numbers[0].replace(",", "."));
    }
  }

  return undefined;
}

/**
 * Extrai coeficiente de aproveitamento do texto
 * Suporta formatos como:
 * - "coeficiente de aproveitamento: 2.5"
 * - "CA: 2,5"
 * - "aproveitamento: 2.5"
 */
function extractCoeficienteAproveitamento(text: string): number | undefined {
  const pattern = /(?:coeficiente\s+de\s+aproveitamento|CA|aproveitamento)[\s:]+(\d+(?:[.,]\d+)?)/gi;
  const matches = text.match(pattern);
  
  if (matches && matches.length > 0) {
    const numbers = matches[0].match(/(\d+(?:[.,]\d+)?)/);
    if (numbers) {
      return parseFloat(numbers[0].replace(",", "."));
    }
  }

  return undefined;
}

/**
 * Calcula nível de confiança baseado na quantidade de dados extraídos
 */
function calculateConfidence(data: Partial<ExtractedPDFData>): "high" | "medium" | "low" {
  const fieldsFound = [
    data.area,
    data.width,
    data.length,
    data.recuoFrontal,
    data.recuoLateral,
    data.recuoFundos,
    data.taxaOcupacao,
    data.coeficienteAproveitamento,
  ].filter((field) => field !== undefined).length;

  if (fieldsFound >= 5) return "high";
  if (fieldsFound >= 3) return "medium";
  return "low";
}

/**
 * Extrai dados estruturados de um PDF de planta arquitetônica
 */
export async function extractDataFromPDF(buffer: Buffer): Promise<ExtractedPDFData> {
  // Extrair texto do PDF
  const rawText = await extractTextFromPDF(buffer);

  // Extrair dados específicos usando regex
  const dimensions = extractDimensions(rawText);
  const area = extractArea(rawText);
  const setbacks = extractSetbacks(rawText);
  const taxaOcupacao = extractTaxaOcupacao(rawText);
  const coeficienteAproveitamento = extractCoeficienteAproveitamento(rawText);

  const extractedData: ExtractedPDFData = {
    ...dimensions,
    area,
    ...setbacks,
    taxaOcupacao,
    coeficienteAproveitamento,
    rawText,
    confidence: "low", // Será calculado abaixo
  };

  // Calcular nível de confiança
  extractedData.confidence = calculateConfidence(extractedData);

  return extractedData;
}
